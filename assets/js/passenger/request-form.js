'use strict';

const domForm = {
  inputLocation: document.getElementById('location'),
  inputDestination: document.getElementById('destination'),
  swapBtn: document.querySelector('.form-request__swap'),
  cars: document.querySelectorAll('.form-request__car'),
};

function handleSwap(e) {
  [domForm.inputLocation.value, domForm.inputDestination.value] = [
    domForm.inputDestination.value,
    domForm.inputLocation.value,
  ];
  e.currentTarget.classList.toggle('form-request__swap--inverted');
}

domForm.swapBtn.addEventListener('click', handleSwap);

function selectcar(e) {
  const selectedcar = e.currentTarget;
  const radio = selectedcar.querySelector("input[type='radio']");
  domForm.cars.forEach((car) => {
    const isTarget = car === selectedcar;
    car.classList.toggle('selected', isTarget);
  });
  radio.checked = true;
}

domForm.cars.forEach((car) => {
  car.addEventListener('click', selectcar);
});
