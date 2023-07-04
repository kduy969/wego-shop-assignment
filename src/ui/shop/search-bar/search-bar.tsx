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
  const [submitted, setSubmitted] = useState(false);
  const onSubmitCB = useCallback(() => {
    onSubmit(text);
    setSubmitted(true);
  }, [text, onSubmit]);
  useKeyPress(KeyboardKeys.Enter, onSubmitCB);
  // useImperativeHandle(ref, () => {
  //   return {
  //     // ... your methods ...
  //   };
  // }, []);
  return (
    <div
      style={style}
      className={classNames(css.container, className, loading && css.disabled)}
    >
      <span className={classNames("material-icons", css.icon)}>search</span>
      <input
        disabled={loading}
        data-testid={"input"}
        value={text}
        maxLength={40}
        onChange={(e) => {
          setSubmitted(false);
          setText(e.target.value);
        }}
        placeholder={"Search by product or restaurant name"}
        className={classNames(css.input)}
      />
      {!!text && !submitted && (
        <div
          data-testid={"confirm-box"}
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
              setSubmitted(true);
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
