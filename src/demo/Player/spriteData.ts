import { Animation } from "../../lib";

export const runRightAnimation: Animation = {
  frames: [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
  ],
  loop: true,
};

export const runLeftAnimation: Animation = {
  frames: [
    [12, 0],
    [13, 0],
    [14, 0],
    [15, 0],
    [16, 0],
    [17, 0],
  ],
  loop: true,
};

export const runUpAnimation: Animation = {
  frames: [
    [6, 0],
    [7, 0],
    [8, 0],
    [9, 0],
    [10, 0],
    [11, 0],
  ],
  loop: true,
};

export const runDownAnimation: Animation = {
  frames: [
    [18, 0],
    [19, 0],
    [20, 0],
    [21, 0],
    [22, 0],
    [23, 0],
  ],
  loop: true,
};

export const rollRightAnimation: Animation = {
  frames: [
    [40, 0],
    [41, 0],
    [42, 0],
    [43, 0],
    [44, 0],
  ],
};

export const rollLeftAnimation: Animation = {
  frames: [
    [50, 0],
    [51, 0],
    [52, 0],
    [53, 0],
    [54, 0],
  ],
};

export const rollUpAnimation: Animation = {
  frames: [
    [45, 0],
    [45, 0],
    [46, 0],
    [47, 0],
    [48, 0],
  ],
};

export const rollDownAnimation: Animation = {
  frames: [
    [55, 0],
    [56, 0],
    [57, 0],
    [58, 0],
    [59, 0],
  ],
};

export const attackRightAnimation: Animation = {
  frames: [
    [24, 0],
    [25, 0],
    [26, 0],
    [27, 0],
  ],
};

export const attackUpAnimation: Animation = {
  frames: [
    [28, 0],
    [29, 0],
    [30, 0],
    [31, 0],
  ],
};

export const attackLeftAnimation: Animation = {
  frames: [
    [32, 0],
    [33, 0],
    [34, 0],
    [35, 0],
  ],
};

export const attackDownAnimation: Animation = {
  frames: [
    [36, 0],
    [37, 0],
    [38, 0],
    [39, 0],
  ],
};

export const idleRightAnimation: Animation = {
  frames: [[0, 0]],
};
export const idleUpAnimation: Animation = {
  frames: [[6, 0]],
};
export const idleLeftAnimation: Animation = {
  frames: [[12, 0]],
};
export const idleDownAnimation: Animation = {
  frames: [[18, 0]],
};

export const playerAnimationsMap = {
  move: {
    right: runRightAnimation,
    left: runLeftAnimation,
    up: runUpAnimation,
    down: runDownAnimation,
  },
  idle: {
    right: idleRightAnimation,
    left: idleLeftAnimation,
    up: idleUpAnimation,
    down: idleDownAnimation,
  },
  attack: {
    right: attackRightAnimation,
    left: attackLeftAnimation,
    up: attackUpAnimation,
    down: attackDownAnimation,
  },
  roll: {
    right: rollRightAnimation,
    left: rollLeftAnimation,
    up: rollUpAnimation,
    down: rollDownAnimation,
  },
};
