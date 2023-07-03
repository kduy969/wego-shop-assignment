import React, { useCallback, useState } from "react";
import css from "./search-bar.module.css";
import { ViewStyle } from "../../base-types/view-style";
import classNames from "classnames";
import { useKeyPress } from "../../../hooks/useKeyPress";
import { KeyboardKeys } from "../../../hooks/key-codes";

type Props = ViewStyle & {
  onSubmit: (text: string) => void; // should be memorized
};

const SearchBar = ({ className, style, onSubmit }: Props) => {
  const [text, setText] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const onSubmitCB = useCallback(() => {
    onSubmit(text);
    setSubmitted(true);
  }, [text, onSubmit]);
  useKeyPress(KeyboardKeys.Enter, onSubmitCB);

  return (
    <div style={style} className={classNames(css.container, className)}>
      <span className={classNames("material-icons", css.icon)}>search</span>
      <input
        value={text}
        maxLength={40}
        onChange={(e) => {
          setSubmitted(false);
          setText(e.target.value);
        }}
        placeholder={"Search by product name"}
        className={css.input}
      />
      <div
        onClick={onSubmitCB}
        className={classNames(css.submitBox, !!text && !submitted && css.show)}
      >
        <div className={css.text}>Apply search</div>
        <div className={css.hint}>Press Enter</div>
      </div>
      {!!text && (
        <span
          className={classNames("material-icons", css.clear)}
          onClick={() => {
            setText("");
            onSubmit("");
            setSubmitted(true);
          }}
        >
          clear
        </span>
      )}
    </div>
  );
};

export default React.memo(SearchBar);
