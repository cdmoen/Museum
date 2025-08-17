
/* =================== PIPE FROM shop.html (leave as-is) =================== */
// shop.html must write items with: data-id, data-name, data-price, data-image
// addToCart(btn) should push objects { id, name, unitPrice, qty, image } to localStorage

const CART_KEY = 'museumCartV1'; // MUST match shop.html

function readCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
}
function writeCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
/* ================= END PIPE ============================================= */


/* ====================== UTILITIES & CONSTANTS =========================== */
// Currency with parentheses for negatives
function money(n) {
    const sign = n < 0 ? -1 : 1;
    const s = '$' + Math.abs(n).toFixed(2);
    return sign < 0 ? '(' + s + ')' : s;
}

// Spec constants
const TAX_RATE = 0.102;
const MEMBER_DISCOUNT_RATE = 0.15;
const SHIPPING_RATE = 25.00;
const VOLUME_TIERS = [
    [0.00, 49.99, 0.00],
    [50.00, 99.99, 0.05],
    [100.00, 199.99, 0.10],
    [200.00, Infinity, 0.15]
];

// Return the volume discount rate given an item total
function volumeRate(total) {
    for (const [min, max, rate] of VOLUME_TIERS) {
        if (total >= min && total <= max) return rate;
    }
    return 0;
}

// Remove a line item entirely (qty=0 => drop row)
function removeItem(id) {
    const next = readCart().filter(it => it.id !== id);
    writeCart(next);
    render();
}

// Clear cart = initial state (cart empty, member unchecked)
function clearCart() {
    writeCart([]);
    document.getElementById('memberToggle').checked = false;
    render();
}

function render() {
    const itemsDiv = document.getElementById('items');
    const summaryPre = document.getElementById('summary');
    const emptyMsg = document.getElementById('emptyMsg');
    const isMember = document.getElementById('memberToggle').checked;
    const cart = readCart().filter(product => product.qty > 0 && product.unitPrice > 0);  // Filter cart items
    let itemTotal = 0;  // (unit price x quantity) of an item
    let subtotalOfItems = 0;  // subtotal of all items before discounts applied
    let volumeDiscount = 0;
    let memberDiscount = 0;
    let shippingCost = SHIPPING_RATE;
    let subtotal = 0;  // final subtotal before tax is applied
    let taxAmount = 0;  // dollar amount of tax owed
    let invoiceTotal = 0;  // final total after tax
    const lineOne = document.createElement("div");
    const lineTwo = document.createElement("div");
    const lineThree = document.createElement("div");
    const lineFour = document.createElement("div");     // creating div element for each line in summary
    const lineFive = document.createElement("div");     // so that it's easier to justify text
    const lineSix = document.createElement("div");
    const lineSeven = document.createElement("div");
    const lineEight = document.createElement("div");
    const lineStyles = {
        display: "flex",
        justifyContent: "space-between"    // variable to apply flex to every line
    };

    Object.assign(lineOne.style, lineStyles);
    Object.assign(lineTwo.style, lineStyles);
    Object.assign(lineThree.style, lineStyles);
    Object.assign(lineFour.style, lineStyles);  // applying flex to every line using the variable
    Object.assign(lineFive.style, lineStyles);
    Object.assign(lineSix.style, lineStyles);
    Object.assign(lineSeven.style, lineStyles);
    Object.assign(lineEight.style, lineStyles);

    itemsDiv.innerHTML = "";  // clearing the content of items upon every repaint so to avoid duplications


    cart.forEach((item) => {
        const itemRow = document.createElement("div");   // iterating through the cart and creating grid items
        Object.assign(itemRow.style, {
            display: "grid",
            gridTemplateColumns: "4fr 1fr 2fr 2fr",   // each item is given a row with 4 columns
            width: "100%",
            height: "100%",
            border: "1px solid black"
        })

        const namePhoto = document.createElement("div");  // first column contains tiny image and item name
        const itemImg = document.createElement("img");
        itemImg.src = `${item.image}`;
        itemImg.style.maxWidth = "70px";
        const itemNameNode = document.createTextNode(`${item.name}`);
        namePhoto.append(itemImg, itemNameNode);
        Object.assign(namePhoto.style, {
            gridColumn: "1/2",
            display: "flex",
            justifyContent: "left",      //adding styles to justify left and create a border
            alignItems: "end",
            padding: "10px",
            borderRight: "1px solid black"
        })
        const qtyColumn = document.createElement("div");
        const itemQty = document.createTextNode(`Qty: ${item.qty}`);  // second column contains item quantity
        qtyColumn.append(itemQty);
        Object.assign(qtyColumn.style, {
            gridColumn: "2/3",
            display: "flex",
            justifyContent: "right",
            alignItems: "center",
            padding: "10px",
            borderRight: "1px solid black"
        })
        const priceColumn = document.createElement("div");
        const unitPriceNode = document.createTextNode(`${money(item.unitPrice)}/ea`);  // third column contains unit price
        priceColumn.append(unitPriceNode);
        Object.assign(priceColumn.style, {
            gridColumn: "3/4",
            display: "flex",
            justifyContent: "right",
            alignItems: "center",
            padding: "10px",
            borderRight: "1px solid black"
        })

        itemTotal = item.unitPrice * item.qty;  // giving a value to itemTotal
        subtotalOfItems += itemTotal;  // updating the subtotal for each item in the cart

        const linePriceNode = document.createTextNode(`${money(itemTotal)}`);  // fourth column contains total item price (unitPrice x qty)
        const totalColumn = document.createElement("div");
        totalColumn.append(linePriceNode);
        Object.assign(totalColumn.style, {
            gridColumn: "4/5",
            display: "flex",
            justifyContent: "right",
            alignItems: "center",
            padding: "10px",
            borderRight: "1px solid black"
        })
        const deleteItem = document.createElement("div");
        const deleteButton = document.createElement("button");  // fifth row contains the 'remove' button
        deleteButton.innerText = "Remove";
        deleteItem.appendChild(deleteButton);
        Object.assign(deleteItem.style, {
            gridColumn: "5/6",
            display: "flex",
            justifyContent: "right",
            alignItems: "center",
            padding: "10px",
            // border: "1px solid black"
        })
        itemsDiv.append(itemRow);  // appending the item row to the parent container itemsDiv

        itemRow.append(namePhoto, qtyColumn, priceColumn, totalColumn, deleteItem);  // appending the child columns to the item row
        deleteItem.addEventListener("click", () => {
            summaryPre.innerHTML = "";
            removeItem(item.id);                   // creating an event listener for the remove button that clears the
            subtotalOfItems -= itemTotal;          // summary totals and subtracts removed item from subtotal
        });
    }
    );

    volumeDiscount = (subtotalOfItems * volumeRate(subtotalOfItems));  // assigning value to the volume discount and member discount AFTER
    memberDiscount = subtotalOfItems * MEMBER_DISCOUNT_RATE;           // items have been added to cart, but BEFORE summary totals are calculated
    // and displayed (took me several headaches to realize this was necessary!)
    if (isMember === true) {
        if (volumeDiscount > 0) {
            let choice = prompt("Only one discount may be applied. Type 'M' for Member or 'V' for Volume:");
            if (choice.toLowerCase() === 'v') {
                summaryPre.innerHTML = "";
                memberDiscount = 0;
                volumeDiscount = (subtotalOfItems * volumeRate(subtotalOfItems));   // prompting user to choose which discount
            }
            else if (choice.toLowerCase() === 'm') {
                summaryPre.innerHTML = "";
                volumeDiscount = 0;
                memberDiscount = subtotalOfItems * MEMBER_DISCOUNT_RATE;
            }
            else {
                summaryPre.innerHTML = "";
            }
        }
        else {
            summaryPre.innerHTML = "";
            memberDiscount = subtotalOfItems * MEMBER_DISCOUNT_RATE;   // if there's no conflict with volume discount, just apply member discount
        }
    }
    else if (isMember === false) {
        summaryPre.innerHTML = "";
        memberDiscount = 0;
        volumeDiscount = (subtotalOfItems * volumeRate(subtotalOfItems));   // if the member discount box isn't checked, only apply volume discount
    }

    if (cart.length > 0) {
        itemsDiv.hidden = false;      // display items and summary if items in cart
        summaryPre.hidden = false;
        subtotal = (subtotalOfItems - volumeDiscount - memberDiscount + SHIPPING_RATE);   // give values to subtotal, tax amount, total invoice
        taxAmount = subtotal * TAX_RATE;
        invoiceTotal = subtotal + taxAmount;

        //subtotal of items
        const subtotalOfItemsLabel = document.createElement("span");    // Creating 2 spans for the contents each summary line.
        subtotalOfItemsLabel.textContent = "Subtotal of Items:";        // One span is for the label and gets justified left, 
        const subtotalOfItemsAmount = document.createElement("span");   // and the other is for the numbers, and gets justified right. 
        subtotalOfItemsAmount.textContent = `${money(subtotalOfItems)}`;
        lineOne.append(subtotalOfItemsLabel, subtotalOfItemsAmount);
        //volume discount
        const volumeDiscountLabel = document.createElement("span");  //label span
        volumeDiscountLabel.textContent = "Volume Discount:";  //label text
        const volumeDiscountAmount = document.createElement("span");  //numbers span
        volumeDiscountAmount.textContent = `${money(volumeDiscount)}`;  //numbers text
        lineTwo.append(volumeDiscountLabel, volumeDiscountAmount);  //appending spans to the appropriate line of the summary
        //member discount
        const memberDiscountLabel = document.createElement("span");
        memberDiscountLabel.textContent = "Member Discount:";
        const memberDiscountAmount = document.createElement("span");
        memberDiscountAmount.textContent = `${money(memberDiscount)}`;
        lineThree.append(memberDiscountLabel, memberDiscountAmount);
        //shipping cost 
        const shippingCostLabel = document.createElement("span");
        shippingCostLabel.textContent = "Shipping Cost:";
        const shippingCostAmount = document.createElement("span");
        shippingCostAmount.textContent = `${money(SHIPPING_RATE)}`;
        lineFour.append(shippingCostLabel, shippingCostAmount);
        //subtotal (taxable)
        const subtotalLabel = document.createElement("span");
        subtotalLabel.textContent = "Subtotal (taxable):";
        const subtotalAmount = document.createElement("span");
        subtotalAmount.textContent = `${money(subtotal)}`;
        lineFive.append(subtotalLabel, subtotalAmount);
        //tax rate
        const taxRateLabel = document.createElement("span");
        taxRateLabel.textContent = "Tax Rate:";
        const taxRateAmount = document.createElement("span");
        taxRateAmount.textContent = ` ${(TAX_RATE * 100).toFixed(1)}%`;
        lineSix.append(taxRateLabel, taxRateAmount);
        //tax amount
        const taxAmountLabel = document.createElement("span");
        taxAmountLabel.textContent = "Tax Amount:";
        const taxAmountAmount = document.createElement("span");
        taxAmountAmount.textContent = `${money(taxAmount)}`;
        lineSeven.append(taxAmountLabel, taxAmountAmount);
        //invoice total
        const invoiceTotalLabel = document.createElement("span");
        invoiceTotalLabel.textContent = "Invoice Total:";
        const invoiceTotalAmount = document.createElement("span");
        invoiceTotalAmount.textContent = `${money(invoiceTotal)}`;
        lineEight.append(invoiceTotalLabel, invoiceTotalAmount);
        //appending all lines to the summary container
        summaryPre.append(lineOne, lineTwo, lineThree, lineFour, lineFive, lineSix, lineSeven, lineEight);
    }
    else if (cart.length <= 0) {
        emptyMsg.hidden = false;   // if cart is empty, display 'empty cart' message and hide summary
        summaryPre.hidden = true;
    }

};





// Events → re-render
document.getElementById('memberToggle').addEventListener('change', render);
document.getElementById('clearBtn').addEventListener('click', clearCart);

// First paint
render();