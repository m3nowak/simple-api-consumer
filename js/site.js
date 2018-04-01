let defaultUrl = "https://test002mikolaj.azurewebsites.net/api/Students/";

function getGlobalUrl() {
	return defaultUrl; 
}

function checkIfValidDate(potentialDate){
	var IsoDateRe = new RegExp("^([0-9]{4})-([0-9]{2})-([0-9]{2})$");

	var matches = IsoDateRe.exec(potentialDate);
	if (!matches) return false;


	var composedDate = new Date(matches[1], (matches[2] - 1), matches[3]);

	return ((composedDate.getMonth() == (matches[2] - 1)) &&
		  (composedDate.getDate() == matches[3]) &&
		  (composedDate.getFullYear() == matches[1]));
}

function validateInputFields(){
	let fname = $("#input-first-name").val();
	let lname = $("#input-last-name").val();
	let bdate = $("#input-birth-date").val();
	if(fname == ""){
		alert("Imię nie może być puste!");
		return false;
	}
	if(lname == ""){
		alert("Nazwisko nie może być puste!");
		return false;
	}
	if(!checkIfValidDate(bdate)){
		alert("Zły format daty");
		return false;
	}
	return true;
}

function remove(ctx) {
	let idRem = $(ctx).parents("tr").children("td.id").text();
	$.ajax({
		type: 'DELETE',
		url: getGlobalUrl()+idRem,
		contentType: "application/json",
		dataType: 'json',
		success: {
			202: function () { console.log("Success!"); }
		}
	});
}
function edit(ctx) {
	let row = $(ctx).parents("tr");
	let cFN = row.children("td.xfirstname").text();
	let cLN = row.children("td.xlastname").text();
	row.children("td.xfirstname").empty();
	row.children("td.xfirstname").append(`<input type="text">${cFN}</input>`);
	row.children("td.xlastname").empty();
	row.children("td.xlastname").append(`<input type="text">${cLN}</input>`);
	row.children("td.xedit").empty();
	row.children("td.xedit").append(`<button onclick="editfin(this)">Zatwierdź</button>`);
}

function editfin(ctx) {
	if(validateInputFields()){
		let row = $(ctx).parents("tr");
		let idRem = row.children("td.id").text();
		$.ajax({
			type: 'PUT',
			url: getGlobalUrl() + idRem,
			contentType: "application/json",
			dataType: 'json',
			data: JSON.stringify({
				FirstName: row.children("td.xfirstname").children("input").val(),
				LastName: row.children("td.xlastname").children("input").val(),
				BirthDate: row.children("td.xbirthdate").children("input").val(),
			}),
			success: function (data) {
				//alert("zmieniono!");
				reload();
			}
		});
	}
	
}

function reload() {
	$("#wait-modal").modal("show");
	$("#wait-modal-info").text("Odświeżanie tabeli");
	$.ajax({
		type: 'GET',
		url: getGlobalUrl(),
		contentType: "application/json",
		dataType: 'json',
		success: function (data) {
			let tbody = $("#tbody");
			tbody.empty();
			for (var i = 0; i < data.length; i++) {
				tbody.append(`<tr>
						<td class="id">${data[i]['Id']}</td>
						<td class="xfirstname">${data[i]['FirstName']}</td>
						<td class="xlastname">${data[i]['LastName']}</td>
						<td class="xbirthdate">${data[i]['BirthDate'].substr(0, 10)}</td>
						<td class="xedit"><button class="edit btn btn-block btn-warning">Edytuj</button></td>
						<td><button class="delete btn btn-block btn-danger">Usuń</button></td>
					</tr>`)
			}
			$("button.edit").click(function () { editModal(this); })
			$("button.delete").click(function () { deleteModal(this); })
			$("#wait-modal").modal("hide");
		}
	});
}

function addModal() {
	$("#input-id").val("");

	$("#group-id").hide();
	$("#data-modal").modal("show");
}

function editModal(ctx) {
	let jqctx = $(ctx);
	let id = jqctx.parents("tr").children("td.id").text();
	$("#input-id").val(id);
	$("#input-id").prop('disabled', true);
	$("#input-first-name").val(jqctx.parents("tr").children("td.xfirstname").text());
	$("#input-last-name").val(jqctx.parents("tr").children("td.xlastname").text());
	$("#input-birth-date").val(jqctx.parents("tr").children("td.xbirthdate").text());
	$("#group-id").show();
	$("#data-modal").modal("show");

}

function deleteModal(ctx) {
	let jqctx = $(ctx);
	let id = jqctx.parents("tr").children("td.id").text();
	$("#delete-modal-id").text(id);
	$("#delete-modal").modal("show");

}

function deleteModalSend() {
	let idRem = $("#delete-modal-id").text();
	$("#wait-modal-info").text("Usuwanie pozycji...");
	$("#delete-modal").modal("hide");
	$("#wait-modal").modal("show");
	$.ajax({
		success: function (data) {
			reload();
		},
		type: 'DELETE',
		url: getGlobalUrl() + idRem,
		contentType: "application/json",
		dataType: 'json',
	});
}

function dataModalSend() {
	if(validateInputFields()){
		let id = $("#input-id").val();
		let firstName = $("#input-first-name").val();
		let lastName = $("#input-last-name").val();
		let birthDate = $("#input-birth-date").val();
		let reqUrl = getGlobalUrl();
		let reqType = 'POST'
		let reqObj = {
			FirstName: firstName,
			LastName: lastName,
			BirthDate: birthDate,
		}
		if (id != "") {
			reqUrl += id;
			reqType = 'PUT';
			reqObj.Id = id;
		}
		else{
			
		}
		$("#wait-modal-info").text("Dodawanie/Edycja pozycji...");
		$("#data-modal").modal("hide");
		$("#wait-modal").modal("show");
		$.ajax({
			type: reqType,
			url: reqUrl,
			contentType: "application/json",
			dataType: 'json',
			data: JSON.stringify(reqObj),
			success: function (data) {
				reload();
			}
		});
	}
}

$(document).ready(function () {
	$("#reload").click(reload);
	$("#data-modal-accept").click(dataModalSend);
	$("#delete-modal-accept").click(deleteModalSend);
	$("#add").click(addModal);
	reload();
});
