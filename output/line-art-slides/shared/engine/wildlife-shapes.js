// Continuous one-line WILDLIFE drawings on a 1280x720 viewBox.
// Signature: a line enters flat from the left, becomes the animal, exits right.
// One unbroken stroke per figure (Loooop-style). Order = slide order.
window.WILDLIFE_SHAPES = [

  { label: 'A sitting cat', d:
    'M -40 600 L 360 600 '                 // ground enters left, to front paws
    + 'C 384 600 402 560 404 520 '         // front leg up
    + 'C 408 470 420 428 452 404 '         // chest up toward the chin
    + 'C 470 392 486 388 502 386 '         // muzzle
    + 'C 520 384 514 356 512 336 '         // up the face to the front ear
    + 'L 496 288 L 544 330 '               // front ear (triangle)
    + 'C 560 322 576 322 592 330 '         // head crown between the ears
    + 'L 612 286 L 596 336 '               // back ear (triangle)
    + 'C 612 356 622 380 622 410 '         // down the back of the head/neck
    + 'C 648 442 706 452 754 474 '         // along the back to the hindquarters
    + 'C 812 498 830 548 804 566 '         // rump down toward the tail base
    + 'C 860 560 902 520 900 476 '         // tail sweeps up and to the right
    + 'C 898 442 866 436 856 466 '         // tail tip curl
    + 'C 850 500 852 540 810 566 '         // tail back down to the body
    + 'C 700 590 520 600 360 600 '         // belly/base back to the ground
    + 'L 1320 600' },

  { label: 'A swan on the water', d:
    'M -40 470 L 340 470 '                 // water enters left
    + 'C 400 470 440 458 462 420 '         // breast rises (front of body)
    + 'C 476 380 464 330 456 286 '         // up the long neck (S-curve)
    + 'C 450 248 460 212 488 200 '         // neck to head
    + 'C 510 190 532 202 530 226 '         // top of the head
    + 'L 470 236 '                         // beak points down-left
    + 'L 528 246 '                         // beak underside
    + 'C 516 270 520 302 540 332 '         // front of neck curves back down
    + 'C 566 372 600 392 652 400 '         // into the body (base of neck)
    + 'C 730 388 806 392 846 424 '         // over the rounded back to the tail
    + 'C 880 448 878 472 840 470 '         // tail settles onto the water (right)
    + 'C 940 470 1050 470 1150 470 '       // water resumes and exits right
    + 'L 1320 470' },

  { label: 'A fish', d:
    'M -40 380 L 300 380 '                 // water/flow enters left
    + 'C 260 380 236 356 236 330 '         // tail fin (upper fluke) at the left
    + 'C 236 356 260 372 300 380 '         // back to the body root (upper tail)
    + 'C 236 380 236 404 236 430 '         // lower tail fluke
    + 'C 260 404 300 388 340 384 '         // tail root into the body underside
    + 'C 460 360 560 300 660 300 '         // belly curve up to the head (right)
    + 'C 740 300 800 340 812 380 '         // round nose of the fish (far right)
    + 'C 800 420 740 460 660 460 '         // top of the head back over the body
    + 'C 560 460 460 400 360 384 '         // dorsal back toward the tail
    + 'C 420 384 480 384 520 384 '         // belly line resumes flowing
    + 'C 700 384 900 380 1000 380 '        // flow exits right
    + 'L 1320 380' },

  { label: 'A bird in flight', d:
    'M -40 400 L 300 400 '                 // flowing line enters left
    + 'C 360 400 420 396 470 372 '         // rise to the left wing
    + 'C 380 300 300 250 250 226 '         // LEFT wing sweeps up to the tip
    + 'C 330 276 430 330 520 372 '         // wing trailing edge back to the body
    + 'C 545 384 560 386 578 384 '         // body top
    + 'C 600 382 706 330 800 250 '         // RIGHT wing sweeps up to the tip
    + 'C 740 330 660 384 596 400 '         // right wing trailing edge to the body
    + 'C 640 410 660 470 660 470 '         // little forked tail down
    + 'C 640 430 610 402 596 400 '         // tail back up to the body
    + 'C 700 404 900 400 1000 400 '        // flow resumes and exits right
    + 'L 1320 400' },

  { label: 'A whale', d:
    'M -40 440 L 330 440 '                 // water enters left
    + 'C 388 440 428 402 460 380 '         // blunt head rises (nose left)
    + 'C 528 334 598 326 668 340 '         // high rounded back
    + 'C 726 352 766 372 798 402 '         // back toward the tail root (right)
    + 'C 820 378 850 342 866 308 '         // tail fluke sweeps up
    + 'C 850 346 822 376 812 404 '         // fluke back down
    + 'C 812 424 806 440 782 440 '         // down onto the water (right)
    + 'C 870 440 970 440 1070 440 '        // water resumes and exits right
    + 'L 1320 440' }
];
