async function getData(url = "./data.json") {
  const response = await fetch(url);
  const data = await response.json();
  fetchedData = data;

  return data;
}
let fetchedData;
let resolution = setResolution();

function setResolution() {
  if (window.screen.width > 1024) {
    return "desktop";
  } else if (window.screen.width > 768 && window.screen.width <= 1024) {
    return "tablet";
  } else {
    return "mobile";
  }
}

function renderItems(data) {
  const catalogContainer = document.querySelector(".catalog__grid");

  for (const item of data) {
    const { category, image, name, price } = item;

    const html = `
        <div class="catalog__item">
          <div class="catalog__item-img">
           <img src="${image[resolution]}" data-catalog-img alt="" />
          </div>
          <div class="catalog__item-add__wrapper">
            <button tton class="catalog__item-btn" data-catalog-btn>
              <img src="./assets/images/icon-add-to-cart.svg" alt="" />Add to Cart
            </button>
            <div class="catalog__item-add hidden">
              <img src="./assets/images/icon-decrement-quantity.svg" data-catalog-minus alt="" />
              <span>1</span>
              <img src="./assets/images/icon-increment-quantity.svg" data-catalog-plus alt="" />
            </div>
          </div>
          <div class="catalog__item-category">${category}</div>
          <h3 class="catalog__item-name">${name}</h3>
          <div class="catalog__item-price">$${price}</div>
        </div>
        `;

    catalogContainer.insertAdjacentHTML("beforeend", html);
  }
}

function toggleItemVisibility(itemBtn, counter) {
  const itemAddBtn = itemBtn
    .closest(".catalog__item-add__wrapper")
    .querySelector(".catalog__item-add");

  if (parseInt(counter.innerText) <= 0) {
    itemAddBtn.classList.add("hidden");
    itemBtn.classList.remove("hidden");
  } else {
    itemAddBtn.classList.remove("hidden");
    itemBtn.classList.add("hidden");
  }
}

function handleCatalogEvents() {
  let itemsCounter = 0;

  document.addEventListener("click", (event) => {
    if (event.target.matches("[data-catalog-btn]")) {
      const itemBtn = event.target;
      const counter = itemBtn.nextElementSibling.querySelector("span");

      counter.innerText = "1";
      itemsCounter += 1;

      const itemCard = itemBtn.closest(".catalog__item");
      addCartItem(itemCard, counter);

      toggleItemVisibility(itemBtn, counter);
    }

    if (event.target.matches("[data-catalog-minus]")) {
      const counter = event.target.closest(".catalog__item-add").querySelector("span");
      const itemBtn = event.target
        .closest(".catalog__item-add__wrapper")
        .querySelector("[data-catalog-btn]");

      const countValue = parseInt(counter.innerText);

      if (countValue > 0) {
        counter.innerText = countValue - 1;
        itemsCounter -= 1;

        toggleItemVisibility(itemBtn, counter);
      }
      addCartItem(itemBtn.closest(".catalog__item"), counter);
    }

    if (event.target.matches("[data-catalog-plus]")) {
      const counter = event.target.closest(".catalog__item-add").querySelector("span");
      const itemBtn = event.target
        .closest(".catalog__item-add__wrapper")
        .querySelector("[data-catalog-btn]");

      counter.innerText = parseInt(counter.innerText) + 1;
      itemsCounter += 1;

      addCartItem(itemBtn.closest(".catalog__item"), counter);
      toggleItemVisibility(itemBtn, counter);
    }

    if (event.target.matches(".cart__item-delete")) {
      const cartItem = event.target.closest(".cart__item");
      const itemTitle = cartItem.querySelector(".cart__item-info__title").innerText;

      cartItem.remove();

      const catalogItem = [...document.querySelectorAll(".catalog__item")].find(
        (item) => item.querySelector(".catalog__item-name").innerText === itemTitle
      );

      if (catalogItem) {
        const counter = catalogItem.querySelector(".catalog__item-add span");
        counter.innerText = "0";

        toggleItemVisibility(catalogItem.querySelector("[data-catalog-btn]"), counter);
      }

      itemsCounter -= parseInt(
        cartItem.querySelector(".cart__item-info__bottom-quantity").innerText
      );
      updateCartTotal();
      updateCartTitle(itemsCounter);
      changeCartState();
    }

    if (event.target.matches(".cart__confirm-btn")) {
      const orderModal = document.querySelector(".order-modal");
      orderModal.classList.remove("hidden");

      const cartItems = document.querySelectorAll(".cart__item");
      renderOrderItem(cartItems);
    }

    if (event.target.matches(".order__cart-btn")) {
      const orderModal = document.querySelector(".order-modal");
      orderModal.classList.add("hidden");

      const catalogContainer = document.querySelector(".catalog__grid");
      catalogContainer.innerHTML = "";
      renderItems(fetchedData);

      const cartContainer = document.querySelector(".cart__items");
      cartContainer.innerHTML = "";

      itemsCounter = 0;
    }

    changeCartState();
    updateCartTitle(itemsCounter);
  });
}

function renderOrderItem(cartItems) {
  const orderItemsContainer = document.querySelector(".order__cart-items");
  orderItemsContainer.innerHTML = "";
  let totalPrice = 0;

  cartItems.forEach((item) => {
    const itemCardInfo = {
      quantity: item.querySelector(".cart__item-info__bottom-quantity").innerText,
      title: item.querySelector(".cart__item-info__title").innerText,
      price: parseFloat(item.querySelector(".cart__item-info__bottom-total").innerText.slice(1)),
      image: fetchedData.find(
        (data) => data.name === item.querySelector(".cart__item-info__title").innerText
      ).image["thumbnail"],
    };
    totalPrice += itemCardInfo.price;

    const orderItemHTML = `
      <div class="order__cart-item">
        <div class="order__cart-item__img"><img src="${itemCardInfo.image}" alt="" /></div>
        <div class="order__cart-item__info">
          <div class="order__cart-item__info-title">${itemCardInfo.title}</div>
          <div class="order__cart-item__info-bottom">
            <div class="order__cart-item__info-quantity">${itemCardInfo.quantity}</div>
            <div class="order__cart-item__info-base">@$${
              itemCardInfo.price / parseInt(itemCardInfo.quantity)
            }</div>
          </div>
        </div>
        <div class="order__cart-item__price">$${itemCardInfo.price}</div>
      </div>
    `;

    orderItemsContainer.insertAdjacentHTML("afterbegin", orderItemHTML);
  });

  const orderTotalPrice = document.querySelector(".order__cart-total__price");
  orderTotalPrice.innerText = `$${totalPrice}`;
}

function changeCartState() {
  if (document.querySelectorAll(".cart__item").length > 0) {
    document.querySelector(".cart__full").classList.remove("hidden");
    document.querySelector(".cart__empty").classList.add("hidden");
  } else {
    document.querySelector(".cart__full").classList.add("hidden");
    document.querySelector(".cart__empty").classList.remove("hidden");
  }
}

function addCartItem(itemCard, counter) {
  const itemCardInfo = {
    counter: parseInt(counter.innerText),
    title: itemCard.querySelector(".catalog__item-name").innerText,
    price: parseFloat(itemCard.querySelector(".catalog__item-price").innerText.slice(1)),
  };

  let isCartItem = null;

  const cartItems = document.querySelectorAll(".cart__item");
  cartItems.forEach((item) => {
    if (itemCardInfo.title === item.querySelector(".cart__item-info__title").innerText) {
      isCartItem = item;

      if (itemCardInfo.counter <= 0) {
        item.remove();
      }
    }
  });

  isCartItem ? updateCartItemInfo(isCartItem, itemCardInfo) : renderCartItem(itemCardInfo);

  updateCartTotal();
}

function updateCartItemInfo(cartItem, itemCardInfo) {
  const { counter, price } = itemCardInfo;
  const quantityElem = cartItem.querySelector(".cart__item-info__bottom-quantity");
  const totalElem = cartItem.querySelector(".cart__item-info__bottom-total");

  const newQuantity = counter;

  quantityElem.innerText = `${newQuantity}x`;
  totalElem.innerText = `$${(newQuantity * price).toFixed(2)}`;
}
function renderCartItem(itemCardInfo) {
  const { title, counter, price } = itemCardInfo;
  const totalItem = price * counter;

  const cartContainer = document.querySelector(".cart__items");
  const cartItemHTML = `
    <div class="cart__item">
        <div class="cart__item-info">
          <div class="cart__item-info__title">${title}</div>
          <div class="cart__item-info__bottom">
            <div class="cart__item-info__bottom-quantity">${counter}x</div>
            <div class="cart__item-info__bottom-base">@ $${price.toFixed(2)}</div>
            <div class="cart__item-info__bottom-total">$${totalItem.toFixed(2)}</div>
          </div>
        </div>
        <div class="cart__item-delete"><img src="./assets/images/icon-remove-item.svg" alt="" /></div>
      </div>
  `;
  cartContainer.insertAdjacentHTML("afterbegin", cartItemHTML);
}
function updateCartTotal() {
  const cartItemsTotalPrice = document.querySelectorAll(".cart__item-info__bottom-total");
  totalCartCost = 0;

  cartItemsTotalPrice.forEach((item) => {
    totalCartCost += parseFloat(item.innerText.slice(1));
  });

  const cartTotalPrice = document.querySelector(".cart__total-price");
  cartTotalPrice.innerText = `$${totalCartCost}`;
}
function updateCartTitle(itemsCounter) {
  const cartCount = document.querySelector(".cart__title");
  cartCount.innerText = `Your Cart (${itemsCounter})`;
}

getData().then((data) => {
  renderItems(data);

  window.addEventListener("resize", setResolution);

  handleCatalogEvents();
});
