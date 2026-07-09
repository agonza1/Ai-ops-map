import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("progressive diagnostic app shell", () => {
  it("starts above the fold with the first diagnostic question and a gated result", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("Map the first AI ops starter kit worth selling.");
    expect(html).toContain("Question 1");
    expect(html).toContain("Which workflow should create the first visible business signal?");
    expect(html).toContain("Answer two questions to reveal the first useful signal.");
    expect(html).not.toContain("Recommended first workflow");
    expect(html).not.toContain("Delivery pod");
  });

  it("orders the first question before supporting intro copy and the gated result", () => {
    const html = renderToStaticMarkup(<App />);
    const questionIndex = html.indexOf("Which workflow should create the first visible business signal?");
    const gatedResultIndex = html.indexOf("Answer two questions to reveal the first useful signal.");
    const introIndex = html.indexOf("Map the first AI ops starter kit worth selling.");

    expect(questionIndex).toBeGreaterThanOrEqual(0);
    expect(gatedResultIndex).toBeGreaterThan(questionIndex);
    expect(introIndex).toBeGreaterThan(gatedResultIndex);
  });

  it("renders diagnostic accessibility hooks in the initial shell", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("<fieldset");
    expect(html).toContain("<legend");
    expect(html).toContain("aria-live=\"polite\"");
    expect(html).toContain("aria-pressed=\"false\"");
  });
});
