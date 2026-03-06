import { describe, it, expect } from "vitest";
import { parseComment, htmlToText } from "../parser.js";

describe("htmlToText", () => {
  it("strips HTML tags and decodes common entities", () => {
    const html = '<p>Hello &amp; <b>world</b></p><br>Next &lt;line&gt;';
    const text = htmlToText(html);
    expect(text).toContain("Hello & world");
    expect(text).toContain("Next <line>");
    expect(text).not.toContain("<b>");
    expect(text).not.toContain("<p>");
  });

  it("converts <p> to double newline and <br> to single newline", () => {
    const html = "First<p>Second<br>Third";
    const text = htmlToText(html);
    expect(text).toContain("First\n\nSecond\nThird");
  });

  it("extracts href from anchor tags", () => {
    const html = 'Check out <a href="https://example.com">our site</a> for more';
    const text = htmlToText(html);
    expect(text).toContain("https://example.com");
    expect(text).not.toContain("<a");
  });

  it("decodes numeric character entities", () => {
    const html = "Hello&#32;World";
    const text = htmlToText(html);
    expect(text).toBe("Hello World");
  });

  it("handles &nbsp; entity", () => {
    const html = "spaced&nbsp;apart";
    const text = htmlToText(html);
    expect(text).toBe("spaced apart");
  });
});

describe("parseComment", () => {
  it("parses a standard pipe-delimited comment", () => {
    const html =
      "Acme Corp | Senior Software Engineer | San Francisco, CA | Remote | $150k-$200k" +
      "<p>We build widgets. Stack: TypeScript, React, Node.js, PostgreSQL." +
      '<p>Apply at <a href="https://acme.com/jobs">https://acme.com/jobs</a>';

    const job = parseComment(123, html, "2026-03-01T00:00:00Z", "March 2026", 999);

    expect(job).not.toBeNull();
    expect(job!.company).toBe("Acme Corp");
    expect(job!.title).toBe("Senior Software Engineer");
    expect(job!.location).toContain("San Francisco");
    expect(job!.isRemote).toBe(true);
    expect(job!.salary).toContain("$150k");
    expect(job!.hnId).toBe(123);
    expect(job!.commentUrl).toBe("https://news.ycombinator.com/item?id=123");
    expect(job!.threadUrl).toBe("https://news.ycombinator.com/item?id=999");
    expect(job!.threadMonth).toBe("March 2026");
  });

  it("parses a comment with unusual formatting (fewer pipes)", () => {
    const html =
      "StartupXYZ - we are hiring engineers" +
      "<p>Looking for people who know Python and React." +
      "<p>Remote OK. Salary: $100k-$140k" +
      "<p>More info and apply at https://startupxyz.com/careers";

    const job = parseComment(456, html, "2026-03-01T00:00:00Z", "March 2026", 999);

    expect(job).not.toBeNull();
    expect(job!.company).toContain("StartupXYZ");
    // Technologies should be extracted from body
    expect(job!.technologies).toContain("python");
    expect(job!.technologies).toContain("react");
  });

  it("extracts salary from the first line", () => {
    const html =
      "BigCo | Engineer | NYC | $180k-$220k" +
      "<p>Join us building great things with Go and Kubernetes.";

    const job = parseComment(789, html, "2026-03-01T00:00:00Z", "March 2026", 999);

    expect(job).not.toBeNull();
    expect(job!.salary).toContain("$180k");
  });

  it("extracts technologies from the text body", () => {
    const html =
      "DevTools Inc | Staff Engineer | Remote" +
      "<p>Our stack: TypeScript, React, Next.js, PostgreSQL, Docker, Kubernetes, AWS." +
      "<p>We also use GraphQL and Tailwind.";

    const job = parseComment(101, html, "2026-03-01T00:00:00Z", "March 2026", 999);

    expect(job).not.toBeNull();
    expect(job!.technologies).toContain("typescript");
    expect(job!.technologies).toContain("react");
    expect(job!.technologies).toContain("next.js");
    expect(job!.technologies).toContain("postgresql");
    expect(job!.technologies).toContain("docker");
    expect(job!.technologies).toContain("kubernetes");
    expect(job!.technologies).toContain("aws");
    expect(job!.technologies).toContain("graphql");
    expect(job!.technologies).toContain("tailwind");
  });

  it("detects remote, onsite, and hybrid flags", () => {
    const remoteHtml =
      "Co1 | Engineer | Remote" + "<p>Fully remote company. Work from anywhere.";
    const onsiteHtml =
      "Co2 | Engineer | NYC | Onsite" + "<p>In-office only, 5 days/week.";
    const hybridHtml =
      "Co3 | Engineer | London | Hybrid" + "<p>3 days in office, 2 remote.";

    const remote = parseComment(1, remoteHtml, "2026-03-01T00:00:00Z", "March 2026", 999);
    const onsite = parseComment(2, onsiteHtml, "2026-03-01T00:00:00Z", "March 2026", 999);
    const hybrid = parseComment(3, hybridHtml, "2026-03-01T00:00:00Z", "March 2026", 999);

    expect(remote!.isRemote).toBe(true);
    expect(onsite!.isOnsite).toBe(true);
    expect(hybrid!.isHybrid).toBe(true);
  });

  it("returns null for deleted/empty comments", () => {
    expect(parseComment(1, "", "2026-03-01T00:00:00Z", "March 2026", 999)).toBeNull();
  });

  it("returns null for very short comments (< 50 chars)", () => {
    const html = "Thanks for sharing!";
    expect(parseComment(1, html, "2026-03-01T00:00:00Z", "March 2026", 999)).toBeNull();
  });

  it("returns null when company name is too short", () => {
    // After html stripping, first pipe-segment is just "A"
    const html =
      "A | | | |" +
      "<p>This is a weird post with a single-char company name and lots of padding to get past the length check for minimum characters.";
    const job = parseComment(1, html, "2026-03-01T00:00:00Z", "March 2026", 999);
    expect(job).toBeNull();
  });

  it("extracts URLs from anchor tags", () => {
    const html =
      "ToolCo | Frontend Dev | Remote" +
      '<p>Apply: <a href="https://toolco.com/apply">https://toolco.com/apply</a>' +
      '<p>More: <a href="https://toolco.com/about">about us</a>';

    const job = parseComment(1, html, "2026-03-01T00:00:00Z", "March 2026", 999);
    expect(job).not.toBeNull();
    expect(job!.url).toBe("https://toolco.com/apply");
  });
});
