let defaultUrl = "https://<nazwa zasobu>.azurewebsites.net/api/Cats/";
let maleStr = "Kocur";
let femaleStr = "Kotka";

// Pozyskanie adresu API
function getGlobalUrl() {
	return defaultUrl;
}

//Sprawdzanie poprawności formatu daty
function checkIfValidDate(potentialDate) {
	var IsoDateRe = new RegExp("^([0-9]{4})-([0-9]{2})-([0-9]{2})$");

	var matches = IsoDateRe.exec(potentialDate);
	if (!matches) return false;


	var composedDate = new Date(matches[1], (matches[2] - 1), matches[3]);

	return ((composedDate.getMonth() == (matches[2] - 1)) &&
		(composedDate.getDate() == matches[3]) &&
		(composedDate.getFullYear() == matches[1]));
}
//Funkcja walidująca pola w modalu do edycji/dodawania rekordów
function validateInputFields() {
	let fname = $("#input-first-name").val();
	let color = $("#input-color").val();
	let bdate = $("#input-birth-date").val();
	let anychecked = $("#input-sex-male").is(':checked') || $("#input-sex-female").is(':checked');

	if (fname == "") {
		alert("Imię nie może być puste!");
		return false;
	}
	if (color == "") {
		alert("Kolor nie może być pusty!");
		return false;
	}
	if (!checkIfValidDate(bdate)) {
		alert("Zły format daty");
		return false;
	}
	if (!anychecked) {
		alert("Należy wybrać płeć");
		return false;
	}
	return true;
}
//Funkcja odpowiadająca za odświeżenie tabeli z rekordami
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
				let sexText = femaleStr;
				if (data[i]['Sex']) sexText = maleStr;
				tbody.append(`<tr>
						<td class="id">${data[i]['Id']}</td>
						<td class="xfirstname">${data[i]['Name']}</td>
						<td class="xcolor">${data[i]['Color']}</td>
						<td class="xsex">${sexText}</td>
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
//Funkcja wyświetlająca modal dodawania nowego wpisu
function addModal() {
	$("#input-id").val("");

	$("#group-id").hide();
	$("#data-modal").modal("show");
}
//Funkcja wyświetlająca modal edycji istniejącego wpisu
function editModal(ctx) {
	let jqctx = $(ctx);
	let id = jqctx.parents("tr").children("td.id").text();
	$("#input-id").val(id);
	$("#input-id").prop('disabled', true);
	$("#input-first-name").val(jqctx.parents("tr").children("td.xfirstname").text());
	$("#input-color").val(jqctx.parents("tr").children("td.xcolor").text());
	sexStr = jqctx.parents("tr").children("td.xsex").text();
	if (sexStr == maleStr) {
		$("#input-sex-male").prop("checked", true);
		$("#input-sex-female").prop("checked", false);
	}
	else {
		$("#input-sex-female").prop("checked", true);
		$("#input-sex-male").prop("checked", false);
	}
	$("#input-birth-date").val(jqctx.parents("tr").children("td.xbirthdate").text());
	$("#group-id").show();
	$("#data-modal").modal("show");

}
//Funkcja otwierająca modal z potwierdzeniem usunięcia
function deleteModal(ctx) {
	let jqctx = $(ctx);
	let id = jqctx.parents("tr").children("td.id").text();
	$("#delete-modal-id").text(id);
	$("#delete-modal").modal("show");

}
//Funkcja wywoływana przy usuwaniu rekordu
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
//Funkcja wywoływana przy dodawaniu lub usuwaniu rekordu
function dataModalSend() {
	if (validateInputFields()) {
		let id = $("#input-id").val();
		let firstName = $("#input-first-name").val();
		let color = $("#input-color").val();
		let sex = $("#input-sex-male").is(':checked');
		let birthDate = $("#input-birth-date").val();
		let reqUrl = getGlobalUrl();
		let reqType = 'POST'
		let reqObj = {
			Name: firstName,
			Color: color,
			Sex: sex,
			BirthDate: birthDate,
		}
		if (id != "") {
			reqUrl += id;
			reqType = 'PUT';
			reqObj.Id = id;
		}
		else {

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
//Polecenie wykonywane po załadowaniu się dokumentu HTML
$(document).ready(function () {
	$("#reload").click(reload);
	$("#data-modal-accept").click(dataModalSend);
	$("#delete-modal-accept").click(deleteModalSend);
	$("#add").click(addModal);
	reload();
});
