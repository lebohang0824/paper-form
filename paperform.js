'use strict'

var paperform = {};
// Initialize
paperform.init = function () {
	paperform.post();
}

// Post request
paperform.post = function () {
	
	// Get forms
	var forms = document.forms;

	for (let i = 0; i < forms.length; i++) {

		let form = forms[i];

		if (this.isPaperForm(form)) {

			let body     = '';
			let elements = form.elements;
			let url      = form.getAttribute('paper-post');

			// Send form
			form.onsubmit = function (e) {

				e.preventDefault();

				body = paperform.fetchInputs(elements);

				// Loader
				paperform.setLoader(form);

				// Make a ajax request
				let req = paperform.postRequest(url, body);

				paperform.onError(req, form);
				paperform.onSuccess(req, form, elements);

				body = '';

			}
			
		}
	}

}

paperform.fetchInputs = function(elements) {
	var body = '';
	for (let j = 0; j < elements.length; j++) {
		// Elements
		let el = elements[j];
		if (el.name.trim() !== '' && el.value.trim() !== '') {
			if (el.type == 'radio') {
				if (el.checked) body +=el.name +'='+ el.value +'&';
			} else {body +=el.name +'='+ el.value +'&';}                  
		}
	}

	return body.slice(0, body.length -1);
}
	
// Check the selected form has min requirements of paperform
paperform.isPaperForm = function (form) {
	if (form.hasAttribute('paper-post')) {
		if (form.getAttribute('paper-post').trim() !== '') {
			return true;
		}
	}
}
	
// Set loader
paperform.setLoader = function (form) {
	if (form.hasAttribute('paper-loader')) {
		if (form.getAttribute('paper-loader').trim() !== '') {
			form.insertAdjacentHTML('afterbegin', form.getAttribute('paper-loader'));
			paperform.loaders += 1;
			return true;
		}
	}
}

// On success
paperform.onSuccess = function (req, form, elements) {
	req.done(function (res) {
		paperform.removeLoader(form);
		paperform.isInputClear(form, elements);
		paperform.requestDone(form, '<div class="alert alert-success">'+res+'</div>');
	});
}

// On error
paperform.onError = function (req, form) {
	req.fail(function (res) {
		paperform.removeLoader(form);
		paperform.requestDone(form, '<div class="alert alert-danger">'+res+'</div>');
	});
}

// Has loader attribute (default: false)
paperform.removeLoader = function (form) {
	if (paperform.loaders > 0) {
		form.firstChild.remove();
		paperform.loaders -= 1;
	}
}

// Display results
paperform.requestDone = function (form, el, speed = 4000) {
	if (form.hasAttribute('paper-results')) {
		if (form.getAttribute('paper-results').trim() === 'true') {
			form.insertAdjacentHTML('afterbegin', el);

			// Check speed is set
			if (form.hasAttribute('paper-timeout')) {
				speed = parseInt(form.getAttribute('paper-timeout'));
			}

			// Remove element
			setTimeout(function () {
				form.firstChild.remove();
			}, speed);
		}
	}
}
	
// Clear inputs
paperform.isInputClear = function (form, elements) {
	if (form.hasAttribute('paper-clear')) {
		if (form.getAttribute('paper-clear').trim() === 'true') {
			for (let j = 0; j < elements.length; j++) {
				// Clear inputs
				let el = elements[j];
				if (el.type == 'text' || el.type == 'email' || el.type == 'number' || el.type == 'textarea') {
					el.value = '';
				}
			}
			return true;
		}
	}
}

// Make Ajax request
paperform.postRequest = function (url, body) {

    let success = false;
    let response = {};
    let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

    xhr.open('POST', url, false);

    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) { 
        	success = true;
        } 
    }

    // Request successful.
    response.done = function (callback) {
    	if (success) {
			callback(xhr.responseText);
    	}
	}

	// Request failed.
	response.fail = function (callback) {
		if (!success) {
			callback(xhr.responseText);
		}
	}

	xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(body);

    return response;

}

paperform.init();
paperform.loaders = 0;
