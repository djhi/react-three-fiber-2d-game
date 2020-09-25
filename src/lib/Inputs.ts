import { useEffect, useMemo, useRef } from "react";

export type InputsApi = {
  isActionPressed: (action: string) => boolean;
  getActionStrength: (action: string) => number;
};

export type InputMap = Record<string, string>;

export type InputsOptions = {
  inputMap?: InputMap;
};

const DefaultInputMap = {
  left: "q",
  right: "d",
  up: "z",
  down: "s",
  attack: " ",
  roll: "f",
};

export const useInputs = ({
  inputMap = DefaultInputMap,
}: InputsOptions): InputsApi => {
  const inputs = useRef<Record<string, number>>({});

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      inputs.current[event.key] = 1;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      inputs.current[event.key] = 0;
    };

    const handleMouseDown = (event: MouseEvent) => {
      inputs.current[`mouseButton${event.button}`] = 1;
    };

    const handleMouseUp = (event: MouseEvent) => {
      inputs.current[`mouseButton${event.button}`] = 0;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [inputMap.down, inputMap.left, inputMap.right, inputMap.up]);

  const api = useMemo(
    () => ({
      isActionPressed: (action: string) => {
        const mapping = inputMap[action];

        if (mapping) {
          const value = inputs.current[mapping];

          return value > 0 ? true : false;
        }

        return false;
      },
      getActionStrength: (action: string) => {
        const mapping = inputMap[action];

        if (!mapping) {
          return 0;
        }

        const value = inputs.current[mapping];

        // eslint-disable-next-line eqeqeq
        return value != undefined ? value : 0;
      },
    }),
    [inputMap]
  );

  return api;
};
