# RGR Plastics Website Action Items

## Phase 1: Immediate Fixes

### User Experience and Conversion

- [ ] Add a visible minimum order quantity beside every quantity field.
- [ ] Display the expected quote response time near the WhatsApp and email CTAs.
- [ ] Add a fallback enquiry form for visitors who cannot use WhatsApp.
- [ ] Capture name, company, email, phone, delivery location, and requirements in the enquiry flow.
- [ ] Add a `Get directions` link to the business location.
- [ ] Display accurate business hours and delivery coverage.
- [ ] Replace the visible `Sample` fallback product image with a professional fallback image.
- [ ] Add a confirmation state after opening or submitting a quote request.

### Accessibility

- [ ] Add a `Skip to main content` link before the navigation.
- [ ] Replace image elements used as buttons with native buttons.
- [ ] Support keyboard activation with both `Enter` and `Space`.
- [ ] Announce cart additions and cart-count changes through an ARIA live region.
- [ ] Add clear `:focus-visible` styles for all interactive controls.
- [ ] Close the mobile navigation after a section link is selected.
- [ ] Add `prefers-reduced-motion` support for transitions and hover effects.
- [ ] Remove global paragraph justification and use left-aligned text for readability.

### HTML and Data Quality

- [ ] Fix the unmatched `.container` structure in the contact section.
- [ ] Normalize spelling to `Tamil Nadu` across page copy, metadata, and structured data.
- [ ] Remove trailing whitespace from material values in `assests/products.json`.
- [ ] Add JSON validation for `assests/products.json` before deployment.
- [ ] Verify every product code has a matching image.

## Phase 2: Performance and SEO

### Image and Page Performance

- [ ] Convert large product and facility PNG files to WebP or AVIF.
- [ ] Resize images to their actual display dimensions.
- [ ] Add responsive `srcset` and `sizes` attributes.
- [ ] Optimize the hero image for the Largest Contentful Paint element.
- [ ] Measure mobile and desktop Core Web Vitals with PageSpeed Insights.
- [ ] Target LCP below 2.5 seconds, INP below 200 ms, and CLS below 0.1 at the 75th percentile.
- [ ] Reduce unused font families and font weights.
- [ ] Consider self-hosting or reducing third-party Font Awesome usage.

### Crawlability and Search Visibility

- [ ] Render essential product names and specifications in initial HTML instead of JavaScript only.
- [ ] Keep important product structured data available in initial HTML.
- [ ] Create dedicated, descriptive URLs for important product categories.
- [ ] Create dedicated product pages when individual products need to rank.
- [ ] Add useful product descriptions, dimensions, MOQ, lead time, and applications.
- [ ] Use a product or factory image instead of the logo for Open Graph sharing.
- [ ] Add `sameAs`, `geo`, `openingHoursSpecification`, and accurate business images to LocalBusiness schema.
- [ ] Validate LocalBusiness and Product structured data with Google's Rich Results Test.
- [ ] Inspect the live page in Google Search Console after deployment.
- [ ] Submit and monitor `sitemap.xml` in Google Search Console.
- [ ] Verify the business in Google Business Profile and keep its details consistent with the website.
- [ ] Add a privacy policy and terms page before introducing analytics or lead capture.

### Content Strategy

- [ ] Create a landing page for HDPE container manufacturing in Tamil Nadu.
- [ ] Create a landing page for pharmaceutical packaging containers.
- [ ] Create a landing page for camphor containers.
- [ ] Create a landing page for plastic packaging supply in Kumbakonam.
- [ ] Create a landing page for custom blow moulding and injection moulding.
- [ ] Add original factory, process, product, and team photography.
- [ ] Add customer industries, testimonials, certifications, and quality-process evidence where accurate.
- [ ] Add an FAQ section addressing MOQ, samples, customization, delivery, materials, and lead times.

## Phase 3: Product Catalogue Improvements

- [ ] Add catalogue search.
- [ ] Add filters for purpose, material, grade, size, and colour.
- [ ] Add product dimensions, weight, closure details, and technical specifications.
- [ ] Add sample-order information.
- [ ] Add custom tooling process, cost guidance, and expected timelines.
- [ ] Add downloadable product datasheets or a catalogue PDF.
- [ ] Add stock or availability information only when it is maintained accurately.
- [ ] Add product enquiry links with the product code prefilled.

## Phase 4: Code Quality and Maintainability

- [ ] Move the large inline JavaScript block from `index.html` into versioned JavaScript files.
- [ ] Split product rendering, cart state, quote generation, storage, and modal behavior into small modules.
- [ ] Validate and sanitize data loaded from `localStorage` before rendering it.
- [ ] Replace inline `onerror` image handlers with centralized fallback logic.
- [ ] Add HTML, CSS, JavaScript, and JSON linting.
- [ ] Add automated checks for broken links and missing image references.
- [ ] Add a CI workflow that runs validation before deployment.
- [ ] Rename `assests` to `assets` with a compatibility transition plan.
- [ ] Add browser testing for product loading, cart persistence, quantity validation, and WhatsApp quote generation.
- [ ] Keep application code, content data, and presentation styles in separate files.

## Phase 5: Measurement and Ongoing Improvement

- [ ] Add privacy-conscious analytics.
- [ ] Track WhatsApp clicks.
- [ ] Track phone clicks.
- [ ] Track email clicks.
- [ ] Track product additions to the quote cart.
- [ ] Track completed quote submissions.
- [ ] Review Search Console queries and landing pages monthly.
- [ ] Review Core Web Vitals monthly.
- [ ] Review broken links, image errors, and form failures after each deployment.
- [ ] Test the main quote journey on a low-end mobile device and a desktop browser.
- [ ] Collect feedback from real customers who request quotes.

## Definition of Done

- [ ] A visitor can understand the business, products, MOQ, service area, and response time without guessing.
- [ ] A visitor can request a quote through WhatsApp or a non-WhatsApp fallback.
- [ ] Product content remains useful if JavaScript fails or is delayed.
- [ ] The site is usable with keyboard navigation and screen readers.
- [ ] Product and business structured data pass validation without misleading claims.
- [ ] Mobile Core Web Vitals meet the recommended thresholds at the 75th percentile.
- [ ] Automated validation passes before every deployment.
