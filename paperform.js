'use strict'

var paperform = {};
// Initialize
paperform.init = function () {
	paperform.post();
}


paperform.loaders = 0;

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

				body = new FormData(form);

				// Make a ajax request
				paperform.postRequest(form, elements, url, body);

				// Loader
				paperform.setLoader(form);

				body = '';

			}
			
		}
	}

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
			paperform.loaders += 1;
			form.insertAdjacentHTML('afterbegin', form.getAttribute('paper-loader'));
			return true;
		}
	}
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
				if (el.type == 'text' || el.type == 'file' || el.type == 'email' || el.type == 'number' || el.type == 'textarea') {
					el.value = '';
				}
			}
			return true;
		}
	}
}

// Make Ajax request
paperform.postRequest = function (form, elements, url, body) {

    let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open('POST', url, true);

    let res = xhr.onreadystatechange = function() {

    	// On success
        if (this.readyState == 4 && (this.status == 200 || this.status == 201)) {
        	paperform.success(form, elements, body, this.responseText);
        } 

        // On error
        if(this.readyState == 2 && this.status >= 300 ) {
        	paperform.fail(form, body, 'error');
        }
    }
    
    // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(body);
}

paperform.success = function (form, elements, body, res) {
	paperform.removeLoader(form);
	paperform.isInputClear(form, elements);
	paperform.requestDone(form, '<div class="alert alert-success">'+res+'</div>');
}

paperform.fail = function (form, body, res) {
	paperform.removeLoader(form);
	paperform.requestDone(form, '<div class="alert alert-danger">'+res+'</div>');
}

paperform.init();
