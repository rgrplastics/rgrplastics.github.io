let addclassID;
let addclassData;
var ourProductsDataHTML = "";
var ourProductsIDHTML = "";

var myPositions = JSON.parse(products);

for (let i = 0; i < myPositions.length; i++) {
  addclassID = i === 0 ? 'class="active"' : "";
  addclassData = i === 0 ? 'class="item active"' : 'class="item"';

  ourProductsIDHTML += `<li data-target="#myCarousel" data-slide-to="${i}" ${addclassID}></li>`;

  ourProductsDataHTML += `
    <div ${addclassData}>
      <div class="row" style="padding:20px">
        <div class="col-md-2"></div>
        <div class="col col-md-4" style="text-align:center">
          <img src="https://source.unsplash.com/random/250x300?product" alt="${myPositions[i].name || 'Product'} container" style="max-width:100%; height:auto;">
        </div>
        <div class="col col-md-4">
          <h4>${myPositions[i].product_code}</h4>
          <p><strong>Name:</strong> ${myPositions[i].name || 'N/A'}</p>
          <p><strong>Dimensions:</strong> Height: ${myPositions[i].height}mm, Diameter: ${myPositions[i].diameter}mm</p>
          <p><strong>Weight:</strong> ${myPositions[i].weight}g</p>
          <p><strong>Colours:</strong> ${myPositions[i].colours.join(", ")}</p>
          <p><strong>Material:</strong> ${myPositions[i].material.join(", ")}</p>
          <p><strong>Grade:</strong> ${myPositions[i].grade.join(", ")}</p>
        </div>
        <div class="col-md-2"></div>
      </div>
    </div>`;
}
