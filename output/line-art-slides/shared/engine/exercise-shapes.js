// Single continuous-line exercise figures on a 1280x720 viewBox.
// Large & legible: head near the top, feet on the baseline (y=590), gentle
// flat tail entering left / exiting right. Continuous line — crossings are OK.
window.EXERCISE_SHAPES = [

  { label: 'Jumping jack', d:
    'M -40 590 L 360 590 '                 // ground entry
    + 'C 400 590 430 586 448 566 '         // left foot
    + 'C 500 500 540 460 566 430 '         // left leg (spread) up to pelvis
    + 'C 560 380 558 340 560 300 '         // pelvis up torso to shoulders
    + 'C 520 250 470 220 430 196 '         // LEFT arm up-out to hand (V)
    + 'C 470 224 520 268 560 296 '         // loop back to neck
    + 'C 600 260 604 176 640 176 '         // neck up into head (left side)
    + 'C 690 176 690 260 648 296 '         // head + down right side of neck
    + 'C 690 268 740 224 810 196 '         // RIGHT arm up-out to hand (V)
    + 'C 760 224 700 260 660 300 '         // loop back down to shoulders
    + 'C 682 340 690 390 700 430 '         // torso/pelvis down into right leg
    + 'C 726 460 766 500 818 566 '         // right leg (spread) to foot
    + 'C 836 586 866 590 906 590 '         // right foot to ground
    + 'L 1320 590' },

  { label: 'Runner mid-stride', d:
    'M -40 560 L 360 560 '                 // ground entry (raised baseline)
    + 'C 380 560 398 554 404 548 '         // rear foot (trailing)
    + 'C 448 500 486 456 512 428 '         // rear shin to knee
    + 'C 552 392 586 366 606 344 '         // rear thigh to hip
    + 'C 596 296 588 250 606 212 '         // torso (leaning forward)
    + 'C 610 176 626 138 660 130 '         // neck up to head
    + 'C 610 112 610 66 660 62 '           // head loop
    + 'C 706 58 714 122 668 140 '          // head close
    + 'C 656 168 650 196 646 216 '         // back down to shoulder
    + 'C 694 236 748 250 786 236 '         // front arm reaching forward, to fist
    + 'C 748 216 700 214 668 232 '         // forearm back toward elbow
    + 'C 636 200 582 214 540 244 '         // rear arm swung back, to fist
    + 'C 566 262 588 300 626 330 '         // return across torso toward hip
    + 'C 676 350 722 372 730 404 '         // front thigh to knee
    + 'C 756 452 774 512 780 552 '         // front shin to foot
    + 'C 800 560 826 560 866 560 '         // front foot to ground
    + 'L 1320 560' },

  { label: 'Deep squat', d:
    'M -40 590 L 380 590 '                 // ground entry
    + 'C 410 590 440 586 470 560 '         // left foot to ankle
    + 'C 520 546 556 552 566 470 '         // left shin (deep) to knee then up thigh
    + 'C 574 420 578 360 592 322 '         // pelvis up torso
    + 'C 588 286 600 244 634 236 '         // neck to head
    + 'C 584 218 584 172 634 168 '         // head loop
    + 'C 682 164 690 228 646 246 '         // head close
    + 'C 634 268 622 300 606 320 '         // down to shoulders
    + 'C 560 356 512 470 486 500 '         // arms reaching forward (down)
    + 'C 472 514 456 512 440 500 '         // hands at shins
    + 'C 520 470 620 356 700 340 '         // sweep to right arm/shoulder
    + 'C 690 384 686 430 700 470 '         // right side of pelvis down to right knee
    + 'C 726 510 748 552 772 566 '         // right shin to foot
    + 'C 792 584 820 590 860 590 '
    + 'L 1320 590' },

  { label: 'Standing toe touch', d:
    'M -40 590 L 380 590 '                 // ground entry
    + 'C 420 590 470 588 520 566 '         // both feet together on ground
    + 'C 560 556 596 552 606 470 '         // legs up (straight) to hip
    + 'C 618 420 628 372 612 336 '         // torso folded forward at hip
    + 'C 588 300 556 276 556 276 '         // reaching down (torso to head area low)
    + 'C 588 250 616 224 636 214 '         // head forward/down
    + 'C 604 196 606 156 646 158 '         // head loop
    + 'C 686 160 682 212 646 226 '         // head close
    + 'C 620 244 596 270 580 292 '         // down to shoulders
    + 'C 552 330 520 400 500 470 '         // arms hanging to reach the feet
    + 'C 494 500 496 540 500 566 '         // hands down at the toes
    + 'C 540 552 596 552 606 470 '         // back to legs (close loop)
    + 'L 606 470 '
    + 'M 606 470 C 660 540 720 566 780 566 '  // (second foot / ground continue)
    + 'C 800 580 826 590 866 590 '
    + 'L 1320 590' },

  { label: 'High-knee march', d:
    'M -40 590 L 420 590 '                 // ground entry
    + 'C 450 590 478 584 490 558 '         // planted foot to ankle (standing leg)
    + 'C 512 512 528 460 540 430 '         // standing shin/thigh to hip
    + 'C 534 384 530 300 546 264 '         // torso
    + 'C 542 228 554 190 588 182 '         // neck to head
    + 'C 538 164 538 118 588 114 '         // head loop
    + 'C 636 110 644 174 600 192 '         // head close
    + 'C 588 214 578 244 566 262 '         // down to shoulders
    + 'C 610 282 652 298 646 328 '         // front arm bent up (pumping)
    + 'C 642 352 656 372 682 366 '         // forearm to fist up
    + 'C 650 344 604 300 540 312 '         // back arm bent down
    + 'C 520 320 516 344 530 360 '         // back fist
    + 'C 566 340 610 320 640 360 '         // to the LIFTED knee (high knee)
    + 'C 668 396 676 430 660 456 '         // lifted thigh up then shin down
    + 'C 640 476 616 480 600 466 '         // lifted foot (in air)
    + 'C 560 440 545 435 540 432 '         // back toward hip
    + 'L 540 430 '
    + 'M 540 430 C 620 470 700 520 740 560 '  // standing leg line continues to ground right
    + 'C 764 580 792 590 832 590 '
    + 'L 1320 590' }
];
