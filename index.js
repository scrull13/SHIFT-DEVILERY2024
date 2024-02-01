document.addEventListener('DOMContentLoaded', () => {
	showCitiesList('fromCity');
	showCitiesList('toCity');
	showPackageList('packageSize');
});

async function showCitiesList(inputId) {
	const inputField = document.getElementById(inputId);

	try {
		const response = await fetch('https://shift-backend.onrender.com/delivery/points');
		const responseData = await response.json();

		console.log('Список городов:');
		responseData.points.forEach(city => {
			console.log(city.name);
		});

		inputField.innerHTML = '';

		const defaultOption = document.createElement('option');
		defaultOption.value = '';
		defaultOption.text = 'Выберите город';
		inputField.appendChild(defaultOption);

		responseData.points.forEach(city => {
			const option = document.createElement('option');
			option.value = city.id;
			option.text = city.name;
			inputField.appendChild(option);
		});
	} catch (error) {
		console.error('Ошибка при загрузке городов:', error);
	}
}

async function showPackageList(inputId) {
	const inputField = document.getElementById(inputId);

	try {
		const response = await fetch('https://shift-backend.onrender.com/delivery/package/types');
		const responseData = await response.json();

		console.log('Список размеров посылки:');
		responseData.packages.forEach(packageItem => {
			console.log(packageItem.name);
		});

		inputField.innerHTML = '';

		const defaultOption = document.createElement('option');
		defaultOption.value = '';
		defaultOption.text = 'Выберите размер посылки';
		inputField.appendChild(defaultOption);

		responseData.packages.forEach(packageItem => {
			const option = document.createElement('option');
			option.value = packageItem.id;
			option.text = packageItem.name;
			inputField.appendChild(option);
		});
	} catch (error) {
		console.error('Ошибка при загрузке размеров:', error);
	}
}

async function calculateDelivery() {
	try {
		const fromCitySelect = document.getElementById('fromCity');
		const toCitySelect = document.getElementById('toCity');
		const packageSizeSelect = document.getElementById('packageSize');

		const selectedFromCity = fromCitySelect.value;
		const selectedToCity = toCitySelect.value;
		const selectedPackageSize = packageSizeSelect.value;


		console.log(selectedFromCity)
		console.log(selectedToCity)
		console.log(selectedPackageSize)
		if (!selectedFromCity || !selectedToCity || !selectedPackageSize) {
			alert('Пожалуйста, выберите все необходимые параметры.');
			return;
		}

		const senderCoordinates = await getPointCoordinates(selectedFromCity);
		const receiverCoordinates = await getPointCoordinates(selectedToCity);
		const packageDetails = await getPackageDetails(selectedPackageSize);

		console.log(senderCoordinates)
		console.log(receiverCoordinates)
		console.log(packageDetails)

		const requestData = {
			package: {
				length: packageDetails.length,
				width: packageDetails.width,
				weight: packageDetails.weight,
				height: packageDetails.height
			},
			senderPoint: senderCoordinates,
			receiverPoint: receiverCoordinates
		};

		const response = await fetch('https://shift-backend.onrender.com/delivery/calc', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestData)
		});

		const responseData = await response.json();

		if (responseData.success) {
			displayCalculationResult(responseData.options);
			console.log(responseData)
		} else {
			console.error('Ошибка при расчете доставки:', responseData.reason);
		}
	} catch (error) {
		console.error('Ошибка при расчете доставки:', error);
	}
}

async function getPointCoordinates(cityId) {
	try {
		const response = await fetch('https://shift-backend.onrender.com/delivery/points');
		const responseData = await response.json();

		const selectedCity = responseData.points.find(city => city.id === cityId);

		return {
			latitude: selectedCity.latitude,
			longitude: selectedCity.longitude
		};
	} catch (error) {
		console.error('Ошибка при получении координат города:', error);
		return {};
	}
}

async function getPackageDetails(packageId) {
	try {
		const response = await fetch('https://shift-backend.onrender.com/delivery/package/types');
		const responseData = await response.json();

		const selectedPackage = responseData.packages.find(packageItem => packageItem.id === packageId);

		return {
			length: selectedPackage.length,
			width: selectedPackage.width,
			weight: selectedPackage.weight,
			height: selectedPackage.height
		};
	} catch (error) {
		console.error('Ошибка при получении данных о посылке:', error);
		return {};
	}
}

function displayCalculationResult(options) {
	const resultContainer = document.getElementById('resultContainer');

	resultContainer.innerHTML = '';

	options.forEach(option => {
		const resultItem = document.createElement('div');
		resultItem.innerHTML = `
            <p>Вариант: ${option.name}</p>
            <p>Тип: ${option.type}</p>
            <p>Стоимость: ${option.price} руб.</p>
            <p>Срок доставки: ${option.days} дней</p>
        `;
		resultContainer.appendChild(resultItem);
	});
}