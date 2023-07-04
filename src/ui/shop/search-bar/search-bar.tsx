import React, { useCallback, useImperativeHandle, useState } from "react";
import css from "./search-bar.module.css";
import { ViewStyle } from "../../base-types/view-style";
import classNames from "classnames";
import { useKeyPress } from "../../../hooks/useKeyPress";
import { KeyboardKeys } from "../../../hooks/key-codes";
import LoadingAnimation from "../loading-animation/loading-animation";

type Props = ViewStyle & {
  onSubmit: (text: string) => void; // should be memorized
  loading: boolean; // filter text is being submitting
};

const SearchBar = ({ className, style, onSubmit, loading }: Props) => {
  const [text, setText] = useState<string>("");
  const [lastSubmitText, setLastSubmitText] = useState("");
  const onSubmitCB = useCallback(() => {
    onSubmit(text);
    setLastSubmitText(text);
  }, [text, onSubmit]);
  useKeyPress(KeyboardKeys.Enter, onSubmitCB);

  // show confirm if text has changed from the last commit
  const showConfirm = text !== lastSubmitText;
  return (
    <div
      data-testid={"search-bar"}
      style={style}
      className={classNames(css.container, className, loading && css.disabled)}
    >
      <span className={classNames("material-icons", css.icon)}>search</span>
      <input
        disabled={loading}
        data-testid={"search-input"}
        value={text}
        maxLength={40}
        onChange={(e) => {
          setText(e.target.value);
        }}
        placeholder={"Search by product or restaurant name"}
        className={classNames(css.input)}
      />
      {showConfirm && (
        <div
          data-testid={"submit-box"}
          onClick={onSubmitCB}
          className={classNames(css.submitBox)}
        >
          <div className={css.text}>Apply search</div>
          <div className={css.hint}>Press Enter</div>
        </div>
      )}
      {loading ? (
        <LoadingAnimation className={css.loading} />
      ) : (
        !!text && (
          <span
            data-testid={"clear-icon"}
            className={classNames("material-icons", css.clear)}
            onClick={() => {
              setText("");
              onSubmit("");
              setLastSubmitText("");
            }}
          >
            clear
          </span>
        )
      )}
    </div>
  );
};

export default React.memo(SearchBar);
