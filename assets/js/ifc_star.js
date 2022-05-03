//GET
const userAction = async () => {
	const response = await fetch('http://192.168.3.106:8123/api/states/input_boolean.trigger_light_sala', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			mode: 'no-cors',
			timeout: 20,
			'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI0Y2M1ZTdmNjIyYmQ0MGYxYWVmOTA1ZWU4MDU4NmIwYiIsImlhdCI6MTY0ODY0MDcwNiwiZXhwIjoxOTY0MDAwNzA2fQ.8PFlog1pV7rHr-E2HRqcxAoJx-rRRa9W8mgWwhyRkvk'
	  	}
	});
	const myJson = await response.json(); //extract JSON from the http response
	if(response.status === 200){
		console.log("luminaria");
		// console.log(JSON.parse(request.response));
	}else {
		console.log(response);
		console.log('error');
	}
}

//POST
const userAction1 = async () => {
	const response = await fetch('http://192.168.3.106:8123/api/services/input_boolean/toggle',
			{
	  		method: 'POST',
			mode: 'cors',
			timeout: 20,
	  		body: {
				"entity_id": "input_boolean.trigger_light_sala"
			},
	 		headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI0Y2M1ZTdmNjIyYmQ0MGYxYWVmOTA1ZWU4MDU4NmIwYiIsImlhdCI6MTY0ODY0MDcwNiwiZXhwIjoxOTY0MDAwNzA2fQ.8PFlog1pV7rHr-E2HRqcxAoJx-rRRa9W8mgWwhyRkvk'
			}
	});
	const myJson = await response.json(); //extract JSON from the http response
	// do something with myJson
  }

document.getElementById("lampada").addEventListener("onload", function(){ userAction(); });
document.getElementById("lampada").addEventListener("click", function(){ userAction1(); });













// const request = new XMLHttpRequest();
// request.open('GET','http://192.168.3.106:8123/api/states/input_boolean.trigger_light_sala');
// request.setRequestHeader('Content-Type','application/json');
// request.setRequestHeader('Authorization','Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI0Y2M1ZTdmNjIyYmQ0MGYxYWVmOTA1ZWU4MDU4NmIwYiIsImlhdCI6MTY0ODY0MDcwNiwiZXhwIjoxOTY0MDAwNzA2fQ.8PFlog1pV7rHr-E2HRqcxAoJx-rRRa9W8mgWwhyRkvk');
// request.send();
// request.onload = () => {
// 	if(request.status === 200){
// 		console.log(JSON.parse(request.response));
// 	}else {
// 		console.log(request);
// 		console.log('error');
// 	}
// }