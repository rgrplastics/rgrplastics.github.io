jq "sort_by(.display_order, .product_code)" products.json  > products1.json
rm products.json
mv products1.json products.json