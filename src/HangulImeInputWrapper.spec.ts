/**
 * @jest-environment jsdom
 */
import { HangulImeInputWrapper } from "./HangulImeInputWrapper";

describe("HangulImeInputWrapper", () => {
  test("sample secenario", () => {
    const input = document.createElement("input");
    const sut = new HangulImeInputWrapper(input);

    sut.insert("ㄱ");
    sut.insert("ㅏ");
    sut.insert("ㄴ");

    expect(input.value).toBe("간");
  });

  test.each<[string[], string]>([
    [["ㄱ", "ㅏ", "ㄴ"], "간"],
    [["ㅇ", "ㅏ", "ㄴ", "ㄴ", "ㅕ", "ㅇ"], "안녕"],
    [["ㅇ", "ㅏ", "ㄴ", " ", "ㄴ", "ㅕ", "ㅇ"], "안 녕"],
    [["ㄱ", "ㅏ", "a", "b", "ㄴ", "ㅏ"], "가ab나"],
    [["a", "ㄱ", "ㅏ"], "a가"],
    [["ㄱ", "ㅏ", "a"], "가a"],
    [["ㅇ", "ㅏ", "ㄴ", "ㄴ", "ㅕ", "ㅇ", "😀"], "안녕😀"],
    [["ㅇ", "ㅏ", "ㄴ", "😀", "😍", "ㄴ", "ㅕ", "ㅇ"], "안😀😍녕"],
    [["안", "녕", "~", "!"], "안녕~!"],
    [["안녕", "~!"], "안녕~!"],
  ])("%p to be %s", (inputChars, expected) => {
    const input = document.createElement("input");
    const sut = new HangulImeInputWrapper(input);

    inputChars.forEach((char) => {
      sut.insert(char);
    });

    expect(input.value).toBe(expected);
  });

  test("change input selection", () => {
    // arrange
    const input = document.createElement("input");
    const sut = new HangulImeInputWrapper(input);
    sut.insert("ㄴ");
    sut.insert("ㅕ");
    sut.insert("ㅇ");

    // act
    input.selectionStart = 0;
    input.selectionEnd = 0;
    sut.checkChangedSelect();
    sut.insert("ㅇ");
    sut.insert("ㅏ");
    sut.insert("ㄴ");

    // assert
    expect(input.value).toBe("안녕");
  });

  test("backspace and change select", () => {
    // arrange
    const input = document.createElement("input");
    const sut = new HangulImeInputWrapper(input);
    sut.insert("ㅎ");
    sut.insert("ㅏ");
    sut.insert("ㄴ");
    sut.insert("ㄴ");
    sut.insert("ㅕ");
    sut.insert("ㅇ");

    // act
    input.selectionStart = 1;
    input.selectionEnd = 1;
    sut.checkChangedSelect();
    sut.backspace();
    sut.insert("ㅇ");
    sut.insert("ㅏ");
    sut.insert("ㄴ");

    // assert
    expect(input.value).toBe("안녕");
  });

  test("if input other key after change selection, then selection move next", () => {
    // arrange
    const input = document.createElement("input");
    const sut = new HangulImeInputWrapper(input);
    sut.insert("ㅋ");
    sut.insert("ㅋ");

    // act
    input.selectionStart = 1;
    input.selectionEnd = 1;
    sut.checkChangedSelect();
    sut.insert("a");

    // assert
    expect(input.selectionStart).toBe(2);
  });
});
