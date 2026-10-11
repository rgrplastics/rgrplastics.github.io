        const brochurePageGroups = [
            { selector: "#page-2 .product-grid-a4", start: 0, count: 6 },
            { selector: "#page-3 .product-grid-a4", start: 6, count: 6 },
            { selector: "#page-4 .product-grid-a4", start: 12, count: 6 },
            { selector: "#page-5 .page5-top-products", start: 18, count: 4 },
        ];

        const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        })[char]);

        const formatProductDimensions = (product) => {
            const dimensions = product?.dimensions || [];
            if (!dimensions.length) return "Standard: N/A";

            return dimensions
                .map((entry) => {
                    const sizeLabel = entry.size ? (entry.size + ": ") : "";
                    const parts = [];
                    if (entry.length) parts.push(`${entry.length}`);
                    if (entry.diameter) parts.push(`${entry.diameter}`);
                    const mouth = entry.mouth ? ", Mouth:" + entry.mouth : "";
                    return `${sizeLabel}${parts.join(" × ")}${mouth}`;
                })
                .join(";");
        };

        const renderBrochureProductCard = (product) => {
            const code = product.product_code;
            const purpose = product.purpose || "Plastic container";
            const colours = (product.colours || ["Standard"]).join(", ");
            const sizes = (product.size || ["Standard"]).join(", ");
            const dimensions = formatProductDimensions(product);
            const image = `img/products/${code.toLowerCase()}.png`;
            const altText = `${code} ${purpose} container`;

            return `
                <article class="product-card-a4">
                    <div class="product-img-holder">
                        <img src="${image}" alt="${escapeHtml(altText)}" loading="lazy" onerror="this.onerror=null;this.src='img/products/container.jpg';">
                    </div>
                    <div class="product-details-holder">
                        <span class="product-code-label">${escapeHtml(code)}</span>
                        <h3 class="product-title">${escapeHtml(purpose)}</h3>
                        <div class="product-specs">
                            <div class="spec-item"><span class="spec-label">Material</span><span class="spec-val">${escapeHtml(product.material || "HDPE")}</span></div>
                            <div class="spec-item"><span class="spec-label">Colours</span><span class="spec-val">${escapeHtml(colours)}</span></div>
                            <div class="spec-item"><span class="spec-label">Sizes</span><span class="spec-val">${escapeHtml(sizes)}</span></div>
                            <div class="spec-item"><span class="spec-label">Dimensions</span><span class="spec-val">${escapeHtml(dimensions).replace(/;/g, '<br/>')}</span></div>
                        </div>
                    </div>
                </article>
            `;
        };

        const renderBrochure = async () => {
            try {
                const response = await fetch("assets/products.json");
                if (!response.ok) throw new Error("Unable to load brochure data");

                const products = await response.json();
                const orderedProducts = [...products].sort((a, b) => (a.display_order ?? Number.MAX_SAFE_INTEGER) - (b.display_order ?? Number.MAX_SAFE_INTEGER));

                brochurePageGroups.forEach(({ selector, start, count }) => {
                    const container = document.querySelector(selector);
                    if (!container) return;
                    const slice = orderedProducts.slice(start, start + count);
                    container.innerHTML = slice.map(renderBrochureProductCard).join("");
                });
            } catch (error) {
                console.warn("Brochure product data could not be loaded.", error);
            }
        };

        renderBrochure();
