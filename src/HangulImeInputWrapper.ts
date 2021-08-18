import HangulIme, { isJamo } from "hangul-ime";
import GraphemeSplitter from "grapheme-splitter";

type ImeModeType = "composing" | "none";
const splitter = new GraphemeSplitter();

export class HangulImeInputWrapper {
  private _latestCursor = 0;
  private _inputElement: HTMLInputElement;
  private _imeMode: ImeModeType = "none";
  private _ime = new HangulIme();

  constructor(inputElement: HTMLInputElement) {
    this._inputElement = inputElement;
  }

  /**
   * 글자를 추가합니다
   * @param character 입력할 글자
   * @example 글자를 입력한다
   * ```
   * ime.insert("ㄱ");
   * ime.insert("a");
   * ime.insert(" ");
   * ime.insert("😍");
   * ```
   */
  public insert(character: string) {
    if (isJamo(character)) {
      this._ime
        .insert(character)
        .onComplete(this.complete)
        .onCompose(this.compose);
    } else {
      this._ime.clear();
      this.insertOtherCharacter(character);
    }
  }

  /**
   * 백스페이스
   */
  public backspace() {
    this._ime
      .backspace()
      .onEmpty(this.backspaceOnInputElement)
      .onCompose(this.compose);
  }

  /**
   * input에서 변경된 select를 확인한다
   */
  public checkChangedSelect() {
    if (this._latestCursor !== this._inputElement.selectionStart) {
      this._imeMode = "none";
      this._ime.clear();
    }
  }

  private insertOtherCharacter = (key: string) => {
    const inputEle = this._inputElement;
    const inputCursor = inputEle.selectionStart!;
    const originText = inputEle.value;
    const frontText = `${originText.slice(0, inputCursor)}${key}`;
    const backText = `${originText.slice(inputCursor)}`;
    const fullText = `${frontText}${backText}`;
    const cursor = frontText.length;

    inputEle.value = fullText;
    this.moveCursor(cursor);

    this._imeMode = "none";
    this._ime.clear();
  };

  private backspaceOnInputElement = () => {
    const inputEle = this._inputElement;
    const inputCursor = inputEle.selectionStart!;
    if (inputCursor <= 0) return;

    const originText = inputEle.value;
    const frontText = `${originText.slice(0, inputCursor)}`;
    const backText = `${originText.slice(inputCursor)}`;

    const modifiedFontText = this.deleteLastCharacter(frontText);
    inputEle.value = `${modifiedFontText}${backText}`;

    const cusorPosition = modifiedFontText.split("").length;
    this.moveCursor(cusorPosition);

    this._imeMode = "none";
    this._ime.clear();
  };

  private compose = (composingChar: string) => {
    const inputEle = this._inputElement;
    const inputCursor = inputEle.selectionStart!;

    let text = inputEle.value.split("");

    if (text.length <= 0) {
      text.push(composingChar);
      this.changeText(text);
      this.moveCursor(inputCursor + 1);
    } else if (this._imeMode === "none") {
      text.splice(inputCursor, 0, composingChar);
      this.changeText(text);
      this.moveCursor(inputCursor + 1);
    } else {
      text[inputCursor - 1] = composingChar;
      this.changeText(text);
      this.moveCursor(inputCursor);
    }

    this._imeMode = "composing";
  };

  private complete = (completedChar: string, composingChar: string) => {
    const inputEle = this._inputElement;
    let text = inputEle.value.split("");

    const oldCharCursor = inputEle.selectionStart! - 1;
    text[oldCharCursor] = completedChar;

    const newCharCursor = inputEle.selectionStart!;
    text.splice(newCharCursor, 0, composingChar);

    this.changeText(text);
    this.moveCursor(newCharCursor + 1);

    this._imeMode = "composing";
  };

  private moveCursor = (cursor: number) => {
    this._inputElement.setSelectionRange(cursor, cursor);
    this._inputElement.focus();
    this._latestCursor = cursor;
  };

  private changeText = (chars: string[]) => {
    this._inputElement.value = chars.reduce((prev, cnt) => `${prev}${cnt}`);
  };

  private deleteLastCharacter(text: string) {
    let chars = splitter.splitGraphemes(text);
    chars.splice(chars.length - 1, 1);
    const modifiedText =
      chars.length > 0
        ? chars.reduce((preValue, cntValue) => {
            return preValue + cntValue;
          })
        : "";
    return modifiedText;
  }
}
