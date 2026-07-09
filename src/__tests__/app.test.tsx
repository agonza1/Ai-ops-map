import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import App from "../App";

describe("progressive diagnostic app shell", () => {
  it("starts above the fold with the first diagnostic question and a gated result", () => {
    const html = renderToStaticMarkup(<App />);

    const diagnosticIndex = html.indexOf('aria-label="AI ops progressive diagnostic"');
    const introIndex = html.indexOf('WebRTC.ventures AI Ops Map');

    expect(diagnosticIndex).toBeGreaterThan(-1);
    expect(introIndex).toBeGreaterThan(-1);
    expect(diagnosticIndex).toBeLessThan(introIndex);
    expect(html).toContain("Map the first AI ops starter kit worth selling.");
    expect(html).toContain("Question 1");
    expect(html).toContain("Which workflow should create the first visible business signal?");
    expect(html).toContain("Answer two questions to reveal the first useful signal.");
    expect(html).not.toContain("Early recommendation");
    expect(html).not.toContain("Recommended first workflow");
    expect(html).not.toContain("Delivery pod");
  });

  it("renders diagnostic accessibility hooks in the initial shell", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain("<fieldset");
    expect(html).toContain("<legend");
    expect(html).toContain("aria-live=\"polite\"");
    expect(html).toContain("aria-current=\"step\"");
    expect(html).toContain("aria-pressed=\"false\"");
  });
});
