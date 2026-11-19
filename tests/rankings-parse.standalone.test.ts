// 亚马逊 Best Sellers 页面的解析：名次、ASIN、标题、价格、评分、评论数，以及被反爬拦截的识别。
// 用一份精简的、结构与亚马逊列表页一致（如 gridItemRoot / zg-bdg-text）的 HTML，不访问外网。
import assert from "node:assert/strict";
import { test } from "node:test";
import { isBlockedPage, parseBestSellers } from "@aihot/backend/rankings/collect";

const PAGE = `
<div id="gridItemRoot" data-asin="B0AAA11111">
  <span class="zg-bdg-text">#1</span>
  <a class="a-link-normal" href="/Some-Product/dp/B0AAA11111/ref=zg_bs"><span>产品一 &amp; 维生素</span></a>
  <span class="a-offscreen">$12.99</span><span class="a-icon-alt">4.6 out of 5 stars</span>
  <a href="/product-reviews/B0AAA11111"><span class="s-underline-text">1,234</span></a>
</div>
<div id="gridItemRoot" data-asin="B0BBB22222">
  <span class="zg-bdg-text">#2</span>
  <a class="a-link-normal" href="/Other/dp/B0BBB22222"><span>产品二</span></a>
  <span class="a-offscreen">$9.50</span><span class="a-icon-alt">4.2 out of 5 stars</span>
  <a href="/product-reviews/B0BBB22222"><span>56</span></a>
</div>`;

test("reads rank, ASIN, title, price, rating and reviews from a Best Sellers page", () => {
  const items = parseBestSellers(PAGE, "https://www.amazon.com/Best-Sellers-Beauty/zgbs/beauty/");
  assert.equal(items.length, 2);
  assert.deepEqual(items.map((i) => i.rank), [1, 2]);
  assert.deepEqual(items.map((i) => i.asin), ["B0AAA11111", "B0BBB22222"]);
  assert.equal(items[0]!.title, "产品一 & 维生素");
  assert.equal(items[0]!.price, "$12.99");
  assert.equal(items[0]!.rating, "4.6");
  assert.equal(items[0]!.reviews, 1234);
  assert.equal(items[0]!.url, "https://www.amazon.com/Some-Product/dp/B0AAA11111/ref=zg_bs");
  assert.equal(items[1]!.title, "产品二");
  assert.equal(items[1]!.reviews, 56);
});

test("without rank badges the container order decides, and duplicates collapse", () => {
  const html = `
    <div data-asin="B0CCC33333"><a class="a-link-normal" href="/x/dp/B0CCC33333"><span>甲</span></a></div>
    <div data-asin="B0CCC33333"><a class="a-link-normal" href="/x/dp/B0CCC33333"><span>甲（重复）</span></a></div>
    <div data-asin="B0DDD44444"><a class="a-link-normal" href="/y/dp/B0DDD44444"><span>乙</span></a></div>`;
  const items = parseBestSellers(html, "https://www.amazon.com/Best-Sellers/x/zgbs/x/");
  assert.deepEqual(items.map((i) => [i.rank, i.title]), [[1, "甲"], [2, "乙"]]);
});

test("a robot-check page is recognised instead of parsed as an empty list", () => {
  assert.equal(isBlockedPage("<form action=\"/errors/validateCaptcha\">Enter the characters you see below</form>"), true);
  assert.equal(isBlockedPage(PAGE), false);
});
