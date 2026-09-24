/**
 * cmi5-wire.js -- the AU side of cmi5 (AICC/ADL, Quartz), written against the
 * spec text. Startup: fetch the token (§8.2), read LMS.LaunchData (§10.2), the
 * learner preferences (§11), our outcome and bookmark State documents; send
 * `initialized` first (§9.3.2). Then `answered` and `progressed` (allowed
 * statements, §7.1.3; progress §9.5.5.1) as the learner works, `completed`
 * then `passed` or `failed` -- each at most once per registration and only
 * one of the two per session (§9.3) -- and `terminated` last (§9.3.8), with
 * durations (§9.5.4). Every request carries X-Experience-API-Version 1.0.3
 * (xAPI 1.0.3 Communication §3.3) and the auth-token as Basic (§8.2.2). A
 * statement counts as sent only when the LRS answered 200 with the id array
 * (xAPI Communication §2.1.2). No dependency; ES5 plus fetch and Promise.
 *
 * Response and pattern spelling (xAPI Data §2.4.4.1) is SCORMWrapper's
 * `to2004Response` / `to2004Patterns` with flavor 'xapi', handed in by the
 * host as `options.toResponse` / `options.toPatterns`, so the two wires never
 * carry two copies of the delimiter table. An answer's `latency` -- content
 * spells it HHHH:MM:SS.SS for SCORM 1.2 -- becomes `result.duration` (xAPI
 * Data §2.4.5, in ISO 8601 as §4.6 requires) through `options.toDuration`, the wrapper's
 * `toTimeinterval`, the same converter the 2004 wire writes `latency` with.
 *
 * WHAT AN ANSWER CARRIES BEYOND ITS RESPONSE (2026-09-24). Every IRI minted
 * below hangs off ONE base, `options.activityBase`: the host hands in the
 * lecture's course IRI from cmi5.xml (Scitter: `package.course_iri`, frozen
 * independent of the hostname), because the launch line's activityId is the LMS's RUNTIME id
 * (§8.1.5), per registration, and a key minted from it would change with every
 * learner. Without the option the runtime id is the base -- deterministic
 * within one registration, and said here so nobody mistakes it for stable.
 *   <base>/ext/<key>          result.extensions: an answer's `extensions`
 *                             short keys, `severity` and `choiceGrade`; also
 *                             `awaySeconds` and `phase` below. A key that is
 *                             already an IRI passes unchanged. The short name
 *                             is always the last path segment.
 *   <base>/objectives/<code>  an objective code the host could not resolve.
 *                             A known code is the `uri` of its CASE item,
 *                             handed in as `options.objectiveIris`
 *                             {code: iri}; either way the activity rides in
 *                             `context.contextActivities.parent` after the
 *                             template's own parent (or the AU when there is
 *                             none), never replacing it (§10.2.1), typed as an
 *                             xAPI objective.
 *   <base>/phases/<phase>     the object of a per-phase `scored` summary.
 * An answer's grade: content's `extensions.choiceGrade` when it gave one
 * (and then `result.success` is `choiceGrade === 'correct'`); else `severity`
 * (caution -> hesitant, danger -> wrong); else a `neutral` result is
 * `hesitant` with `success: false`. `severity` itself goes through too. Which
 * answers the HOST scores is the host's business and unchanged by any of this.
 *
 * `scored` (allowed, §7.1.3: sessionid from the template, no cmi5 category):
 * at finish, once per session, one per objective and one per `phase` -- raw =
 * right answers, max = graded answers, over the FIRST report of each
 * interaction id, counted only if that report is graded (result correct/wrong
 * and `extensions.graded !== false`). A retry is not a second attempt at the
 * objective, and a first report that was not graded keeps the id out.
 *
 * `signal(name)`: what the host itself can see of the learner, sent as
 * allowed statements between initialized and terminated (§9.3) and never
 * outside that: `suspended` (the page hidden), `resumed` (back, with
 * awaySeconds), `exited` (closing a registration that never completed, with
 * progress). Each verb is one ADL already defines -- `suspended` and `resumed`
 * in the SCORM profile (https://w3id.org/xapi/scorm), `exited` in the ADL
 * vocabulary (https://w3id.org/xapi/adl: "the actor intentionally departed")
 * -- because a reader groups by the verb IRI and an IRI nobody defined groups
 * with nothing. NOT `abandoned`: §9.3.6 gives it to the LMS ("AU Obligations:
 * None") for a session that ended abnormally, and "the LMS MUST NOT allow any
 * statements to be recorded for a session after recording an 'Abandoned'
 * statement" -- so an LMS keying on the verb could refuse the `terminated`
 * that follows ours, and every learner who closes to come back later would
 * read as a crash. Whether each is sent at all is the host's switch, not this
 * file's.
 */
(function (global) {
  'use strict';

  var VERB = {
    initialized: 'http://adlnet.gov/expapi/verbs/initialized',
    answered: 'http://adlnet.gov/expapi/verbs/answered',
    progressed: 'http://adlnet.gov/expapi/verbs/progressed',
    completed: 'http://adlnet.gov/expapi/verbs/completed',
    passed: 'http://adlnet.gov/expapi/verbs/passed',
    failed: 'http://adlnet.gov/expapi/verbs/failed',
    terminated: 'http://adlnet.gov/expapi/verbs/terminated',
    scored: 'http://adlnet.gov/expapi/verbs/scored',
    suspended: 'http://adlnet.gov/expapi/verbs/suspended',
    resumed: 'http://adlnet.gov/expapi/verbs/resumed',
    exited: 'http://adlnet.gov/expapi/verbs/exited'
  };
  var CAT_CMI5 = 'https://w3id.org/xapi/cmi5/context/categories/cmi5';
  var CAT_MOVEON = 'https://w3id.org/xapi/cmi5/context/categories/moveon';
  var EXT_MASTERY = 'https://w3id.org/xapi/cmi5/context/extensions/masteryscore';
  var EXT_PROGRESS = 'https://w3id.org/xapi/cmi5/result/extensions/progress';
  var INTERACTION = 'http://adlnet.gov/expapi/activities/cmi.interaction';
  var OBJECTIVE = 'http://adlnet.gov/expapi/activities/objective';
  var ASSESSMENT = 'http://adlnet.gov/expapi/activities/assessment';
  var SEVERITY_GRADE = { caution: 'hesitant', danger: 'wrong' };
  var OUTCOME = 'scitter.outcome';
  var BOOKMARK = 'scitter.bookmark';
  var XAPI_TYPE = { 'choice': 'choice', 'true-false': 'true-false', 'fill-in': 'fill-in', 'long-fill-in': 'long-fill-in',
    'matching': 'matching', 'performance': 'performance', 'sequencing': 'sequencing', 'likert': 'likert', 'numeric': 'numeric', 'other': 'other' };

  function uuid() {
    var c = global.crypto;
    if (c && c.randomUUID) { return c.randomUUID(); }
    var b = []; for (var i = 0; i < 16; i++) { b.push(Math.floor(Math.random() * 256)); }
    b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
    var h = b.map(function (x) { return (x < 16 ? '0' : '') + x.toString(16); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }
  function duration(ms) { return 'PT' + (Math.max(0, ms) / 1000).toFixed(2).replace(/\.?0+$/, '') + 'S'; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function plain(t, v) { return v === undefined || v === null ? '' : String(v); }
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function isIri(key) { return /^[A-Za-z][A-Za-z0-9+.-]*:/.test(key); }
  /** `'hq1 hq3'`, `'hq1,hq3'` or `['hq1', 'hq3']` -> ['hq1', 'hq3'], each once. */
  function codesOf(value) {
    var list = Array.isArray(value) ? value : plain(null, value).split(/[\s,]+/);
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var code = plain(null, list[i]).trim();
      if (code && out.indexOf(code) < 0) { out.push(code); }
    }
    return out;
  }
  function score(right, count) { return { scaled: Math.round((right / count) * 10000) / 10000, raw: right, min: 0, max: count }; }

  function Cmi5Wire(launch, options) {
    options = options || {};
    this.kind = 'cmi5';
    this.launch = launch;
    this.actor = typeof launch.actor === 'string' ? JSON.parse(launch.actor) : launch.actor;
    this.fetchImpl = options.fetchImpl || function () { return global.fetch.apply(global, arguments); };
    this.now = options.now || function () { return Date.now(); };
    this.packageMastery = options.masteryScore === undefined ? null : options.masteryScore;   // 0-100 or null
    this.language = options.language || 'ar-SA';
    this.toResponse = options.toResponse || plain;
    this.toPatterns = options.toPatterns || function (t, v) { return [plain(t, v)]; };
    // Without the host's converter only a value already in ISO 8601 passes;
    // anything else is left off: an LRS MUST reject a statement carrying a
    // value that does not follow its format (xAPI Data §2.2), and the answer
    // would go with it.
    this.toDuration = options.toDuration || function (v) { var s = String(v); return s.charAt(0) === 'P' ? s : null; };
    this.base = String(options.activityBase || launch.activityId).replace(/\/$/, '');
    this.objectiveIris = options.objectiveIris || {};
    this.firstReports = {};         // interaction id -> its first report, for `scored`
    this.reportOrder = [];
    this.scoredSent = false;        // `scored` once per session
    this.progress = 0;              // the last progress sent, 0-100, for `exited`
    this.awayAt = null;             // when the page was hidden, for `resumed`
    this.token = null;
    this.launchData = { launchMode: 'Normal', contextTemplate: {} };
    this.preferences = null;
    this.outcome = { completed: false, passed: false };
    this.assessed = false;          // one of passed/failed per session (§9.3)
    this.bookmark = '';
    this.startedAt = null;
    this.phase = 'created';         // created -> initializing -> ready -> terminated | failed
    this.queue = Promise.resolve(); // statements and State writes, in order
    this.ready = null;              // the initialize() promise
  }

  Cmi5Wire.launchFrom = function (search) {
    var params = {};
    String(search || '').replace(/^\?/, '').split('&').forEach(function (pair) {
      if (!pair) { return; }
      var eq = pair.indexOf('=');
      params[decodeURIComponent(eq < 0 ? pair : pair.slice(0, eq))] = decodeURIComponent(eq < 0 ? '' : pair.slice(eq + 1).replace(/\+/g, ' '));
    });
    var need = ['endpoint', 'fetch', 'actor', 'registration', 'activityId'];
    for (var i = 0; i < need.length; i++) { if (!params[need[i]]) { return null; } }
    return { endpoint: params.endpoint.replace(/\/$/, ''), fetch: params.fetch, actor: params.actor, registration: params.registration, activityId: params.activityId };
  };

  Cmi5Wire.prototype._headers = function (json) {
    var h = { 'X-Experience-API-Version': '1.0.3' };
    if (this.token) { h.Authorization = 'Basic ' + this.token; }
    if (json) { h['Content-Type'] = 'application/json'; }
    return h;
  };
  Cmi5Wire.prototype._stateUrl = function (id) {
    return this.launch.endpoint + '/activities/state?stateId=' + encodeURIComponent(id) +
      '&activityId=' + encodeURIComponent(this.launch.activityId) +
      '&agent=' + encodeURIComponent(JSON.stringify(this.actor)) +
      '&registration=' + encodeURIComponent(this.launch.registration);
  };
  /** GET a JSON document: 404 is "none" (null); any other refusal is an error the caller decides on. */
  Cmi5Wire.prototype._getJson = function (url) {
    return this.fetchImpl(url, { headers: this._headers(false) }).then(function (r) {
      if (r.status === 404) { return null; }
      if (!r.ok) { throw new Error('LRS answered ' + r.status + ' for ' + url.split('?')[0]); }
      return r.json();
    });
  };
  Cmi5Wire.prototype._putNow = function (id, doc) {
    return this.fetchImpl(this._stateUrl(id), { method: 'PUT', headers: this._headers(true), body: JSON.stringify(doc) }).catch(function () {});
  };
  Cmi5Wire.prototype._putState = function (id, doc) {
    var self = this;
    this.queue = this.queue.then(function () { return self._putNow(id, doc); }).catch(function () {});
    return this.queue;
  };
  /** POST one statement, in order. Resolves true only on HTTP 200 with an
   *  array (xAPI Communication §2.1.2). `after(stored)` runs INSIDE the queue,
   *  before anything queued later -- so an outcome's State write always lands
   *  ahead of `terminated`, which may close the token (cmi5 §8.2.1). */
  Cmi5Wire.prototype._send = function (statement, keepalive, after) {
    var self = this;
    var init = { method: 'POST', headers: this._headers(true), body: JSON.stringify(statement) };
    if (keepalive) { init.keepalive = true; }
    var attempt = this.queue.then(function () { return self.fetchImpl(self.launch.endpoint + '/statements', init); })
      .then(function (r) {
        if (!r || r.status !== 200) { throw new Error('LRS answered ' + (r && r.status)); }
        return r.json().then(function (ids) { if (!Array.isArray(ids)) { throw new Error('LRS did not return statement ids'); } return true; });
      })
      .catch(function (e) { if (global.console) { console.warn('[cmi5] statement not stored: ' + e); } return false; });
    var settled = attempt.then(function (stored) { return after ? after(stored) : undefined; }).catch(function () {});
    this.queue = settled;
    return settled.then(function () { return attempt; });
  };
  Cmi5Wire.prototype._statement = function (verb, object, result, kind) {
    var context = clone(this.launchData.contextTemplate || {});
    context.registration = this.launch.registration;
    context.contextActivities = context.contextActivities || {};
    if (kind === 'defined' || kind === 'outcome') {
      context.contextActivities.category = (context.contextActivities.category || []).concat([{ id: CAT_CMI5 }]);
    }
    if (kind === 'outcome') { context.contextActivities.category.push({ id: CAT_MOVEON }); }
    var s = { id: uuid(), actor: this.actor, verb: { id: verb }, object: object, context: context, timestamp: new Date(this.now()).toISOString() };
    if (result) { s.result = result; }
    return s;
  };
  Cmi5Wire.prototype._au = function () { return { objectType: 'Activity', id: this.launch.activityId }; };

  Cmi5Wire.prototype.initialize = function () {
    var self = this;
    if (this.ready) { return this.ready; }
    this.phase = 'initializing';
    this.ready = this.fetchImpl(this.launch.fetch, { method: 'POST', headers: { 'X-Experience-API-Version': '1.0.3' } })
      .then(function (r) { return r.json(); })
      .then(function (body) {
        if (!body || !body['auth-token']) { throw new Error('no auth-token from the fetch URL (cmi5 8.2)'); }
        self.token = body['auth-token'];
        return self._getJson(self._stateUrl('LMS.LaunchData'));
      })
      .then(function (data) {
        if (!data) { throw new Error('LMS.LaunchData could not be read (cmi5 10.2)'); }
        self.launchData = data;
        return self._getJson(self.launch.endpoint + '/agents/profile?agent=' + encodeURIComponent(JSON.stringify(self.actor)) + '&profileId=cmi5LearnerPreferences');
      })
      .then(function (prefs) {
        self.preferences = prefs || null;
        return self._getJson(self._stateUrl(OUTCOME));
      })
      .then(function (outcome) {
        if (outcome) { self.outcome = { completed: !!outcome.completed, passed: !!outcome.passed }; }
        return self._getJson(self._stateUrl(BOOKMARK));
      })
      .then(function (kept) {
        self.bookmark = kept && kept.location ? String(kept.location) : '';
        self.startedAt = self.now();
        return self._send(self._statement(VERB.initialized, self._au(), null, 'defined'));
      })
      .then(function (stored) {
        if (!stored) { throw new Error('the LRS refused the initialized statement; no session (cmi5 7.1.3)'); }
        self.phase = 'ready';
      })
      .catch(function (e) { self.phase = 'failed'; throw e; });
    return this.ready;
  };
  Cmi5Wire.prototype.resume = function () { return { finished: this.outcome.completed, location: this.bookmark }; };
  Cmi5Wire.prototype.setLocation = function (id) {
    this.bookmark = id;
    if (this.phase !== 'ready') { return; }
    this._putState(BOOKMARK, { location: id });
  };
  Cmi5Wire.prototype.setProgress = function (fraction) {
    if (this.phase !== 'ready' || this.outcome.completed) { return; }   // §9.5.5.1: no progress after completion
    var result = { extensions: {} };
    result.extensions[EXT_PROGRESS] = Math.max(0, Math.min(100, Math.round(Number(fraction) * 100) || 0));
    this.progress = result.extensions[EXT_PROGRESS];
    this._send(this._statement(VERB.progressed, this._au(), result, 'allowed'));
  };
  Cmi5Wire.prototype._ext = function (key) { return isIri(key) ? key : this.base + '/ext/' + encodeURIComponent(key); };
  /** An objective's activity: its CASE item's uri when the host knows the code, else under the base. */
  Cmi5Wire.prototype._objective = function (code) {
    var known = has(this.objectiveIris, code) ? this.objectiveIris[code] : '';
    return { objectType: 'Activity', id: known || (this.base + '/objectives/' + encodeURIComponent(code)), definition: { type: OBJECTIVE } };
  };
  /** The template's parent, or the AU when it has none, with `extra` appended -- added, never overwritten (§10.2.1). */
  Cmi5Wire.prototype._withParent = function (s, extra) {
    var parent = (s.context.contextActivities.parent || [this._au()]).slice();
    var ids = parent.map(function (a) { return a.id; });
    (extra || []).forEach(function (a) { if (ids.indexOf(a.id) < 0) { parent.push(a); ids.push(a.id); } });
    s.context.contextActivities.parent = parent;
    return s;
  };
  Cmi5Wire.prototype.recordInteraction = function (index, data) {
    if (this.phase !== 'ready') { return; }
    var self = this;
    var type = data.type || 'choice';
    var definition = { type: INTERACTION, interactionType: XAPI_TYPE[type] || 'other' };
    if (data.description) { definition.name = {}; definition.name[this.language] = String(data.description); }
    if (data.correct !== undefined && data.correct !== null) { definition.correctResponsesPattern = this.toPatterns(type, data.correct, 'xapi'); }
    var object = { objectType: 'Activity', id: this.launch.activityId + '/interactions/' + encodeURIComponent(data.id || ('interaction_' + index)), definition: definition };
    var result = { response: this.toResponse(type, data.response, 'xapi') };
    var graded = data.result === 'correct' || data.result === 'wrong' || data.result === 'incorrect';
    if (graded) { result.success = data.result === 'correct'; }
    if (data.latency) { var took = this.toDuration(data.latency); if (took) { result.duration = took; } }
    var given = data.extensions && typeof data.extensions === 'object' ? data.extensions : {};
    var extensions = {}, any = false;
    for (var key in given) {
      if (has(given, key) && given[key] !== undefined) { extensions[this._ext(key)] = given[key]; any = true; }
    }
    var grade = given.choiceGrade;
    if (grade !== undefined && grade !== null && grade !== '') {
      result.success = grade === 'correct';
    } else {
      grade = (data.severity && SEVERITY_GRADE[data.severity]) || (data.result === 'neutral' ? 'hesitant' : null);
      if (grade) {
        extensions[this._ext('choiceGrade')] = grade; any = true;
        if (!graded) { result.success = false; }
      }
    }
    if (data.severity) { extensions[this._ext('severity')] = String(data.severity); any = true; }
    if (any) { result.extensions = extensions; }
    var codes = codesOf(data.objectives);
    var id = String(data.id || ('interaction_' + index));
    if (!has(this.firstReports, id)) {
      this.firstReports[id] = { codes: codes, phase: given.phase, graded: graded && given.graded !== false, right: data.result === 'correct' };
      this.reportOrder.push(id);
    }
    var s = this._statement(VERB.answered, object, result, 'allowed');
    this._send(this._withParent(s, codes.map(function (c) { return self._objective(c); })));
  };
  /** One `scored` per objective and one per phase, from the first report of each interaction (see the header). */
  Cmi5Wire.prototype._sendScored = function () {
    if (this.scoredSent) { return; }
    this.scoredSent = true;
    var self = this, byCode = {}, codes = [], byPhase = {}, phases = [];
    function tally(table, order, key, right) {
      if (!has(table, key)) { table[key] = { right: 0, count: 0 }; order.push(key); }
      table[key].count += 1;
      if (right) { table[key].right += 1; }
    }
    this.reportOrder.forEach(function (id) {
      var r = self.firstReports[id];
      if (!r.graded) { return; }
      r.codes.forEach(function (c) { tally(byCode, codes, c, r.right); });
      if (r.phase !== undefined && r.phase !== null && r.phase !== '') { tally(byPhase, phases, String(r.phase), r.right); }
    });
    codes.forEach(function (c) {
      self._send(self._withParent(self._statement(VERB.scored, self._objective(c), { score: score(byCode[c].right, byCode[c].count) }, 'allowed')));
    });
    phases.forEach(function (p) {
      var name = {}; name[self.language] = p;
      var object = { objectType: 'Activity', id: self.base + '/phases/' + encodeURIComponent(p), definition: { type: ASSESSMENT, name: name } };
      var result = { score: score(byPhase[p].right, byPhase[p].count), extensions: {} };
      result.extensions[self._ext('phase')] = p;
      self._send(self._withParent(self._statement(VERB.scored, object, result, 'allowed')));
    });
  };
  /** What the host sees of the learner (see the header): 'suspended', 'resumed' or 'exited'. Nothing outside a live session. */
  Cmi5Wire.prototype.signal = function (name) {
    if (this.phase !== 'ready') { return; }
    var result = null;
    if (name === 'suspended') {
      if (this.awayAt !== null) { return; }
      this.awayAt = this.now();
    } else if (name === 'resumed') {
      if (this.awayAt === null) { return; }
      result = { extensions: {} };
      result.extensions[this._ext('awaySeconds')] = Math.max(0, Math.round((this.now() - this.awayAt) / 100) / 10);
      this.awayAt = null;
    } else if (name === 'exited') {
      if (this.outcome.completed) { return; }          // leaving a completed registration is not leaving it unfinished
      result = { completion: false, duration: duration(this.now() - this.startedAt), extensions: {} };
      result.extensions[EXT_PROGRESS] = this.progress;
    } else {
      return;
    }
    // keepalive on the two a closing page sends: the request must outlive it.
    this._send(this._withParent(this._statement(VERB[name], this._au(), result, 'allowed')), name !== 'resumed');
  };
  Cmi5Wire.prototype.finish = function (outcome) {
    if (this.phase !== 'ready' || this.launchData.launchMode !== 'Normal') { return; }
    var self = this;
    var elapsed = duration(this.now() - this.startedAt);
    var lmsMastery = typeof this.launchData.masteryScore === 'number' ? this.launchData.masteryScore : null;
    var mastery = lmsMastery !== null ? lmsMastery : (this.packageMastery === null ? null : this.packageMastery / 100);
    this._sendScored();
    if (!this.outcome.completed) {
      this.outcome.completed = true;                    // claimed BEFORE the send: never twice (§9.3)
      this._send(this._statement(VERB.completed, this._au(), { completion: true, duration: elapsed }, 'outcome'), false,
        function (stored) {
          if (stored) { return self._putNow(OUTCOME, self.outcome); }
          self.outcome.completed = false;
        });
    }
    if (mastery !== null && outcome.graded > 0 && !this.outcome.passed && !this.assessed) {
      this.assessed = true;                             // one of passed/failed per session (§9.3)
      var scaled = Math.round(outcome.pct) / 100;
      var passed = scaled >= mastery;
      var result = { score: { scaled: scaled, raw: Math.round(outcome.pct), min: 0, max: 100 }, success: passed, duration: elapsed };
      var s = this._statement(passed ? VERB.passed : VERB.failed, this._au(), result, 'outcome');
      if (lmsMastery !== null) { s.context.extensions = s.context.extensions || {}; s.context.extensions[EXT_MASTERY] = lmsMastery; }   // §9.6.3.2
      if (passed) { this.outcome.passed = true; }
      this._send(s, false, function (stored) {
        if (stored) { if (passed) { return self._putNow(OUTCOME, self.outcome); } return undefined; }
        self.assessed = false;
        if (passed) { self.outcome.passed = false; }
      });
    }
  };
  Cmi5Wire.prototype.close = function (end) {
    var self = this;
    if (this.phase === 'terminated' || this.phase === 'failed') { return Promise.resolve(); }
    var started = this.ready || this.initialize();       // closing before initialize(): initialized still goes first (§7.1.1)
    return started.catch(function () {}).then(function () {
      if (self.phase !== 'ready') { return; }
      self.phase = 'terminated';
      var elapsed = duration(self.now() - self.startedAt);
      return self._send(self._statement(VERB.terminated, self._au(), { duration: elapsed }, 'defined'), true)
        .then(function () { return self.queue; })         // the outcome and bookmark writes land before any redirect
        .then(function () {
          if (self.launchData.returnURL && global.location) { global.location.href = self.launchData.returnURL; }   // §10.2.6
        });
    });
  };
  Cmi5Wire.prototype.commit = function () {};

  global.Cmi5Wire = Cmi5Wire;
})(typeof window !== 'undefined' ? window : this);
