userId = "{{ user.id }}"

// Getting recent date to finter the fetch xml to remove the cache issue 

const now = new Date();
const formattedDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

// ---------------------- API FUNCTIONS ------------------------

async function fetchPurchasableItemsGroup(id) {
    const fetchXml = `
    <fetch>
      <entity name="wdrgns_purchasableitemgroup">
        <attribute name="wdrgns_event" />
        <filter>
          <condition attribute="wdrgns_purchasableitemgroupid" operator="eq" value="${id}" />
        </filter>
      </entity>
    </fetch>
  `;
    const url = `/_api/wdrgns_purchasableitemgroups?fetchXml=${encodeURIComponent(fetchXml)}`;
    const response = await fetch(url, {
        headers: { "Accept": "application/json" }
    });
    if (!response.ok) return "";
    const data = await response.json();
    return data.value?.[0] || "";
}


async function fetchEventName(eventId) {
    const fetchXml = `
    <fetch>
      <entity name="wdrgns_event">
        <attribute name="wdrgns_event" />
        <filter>
          <condition attribute="wdrgns_eventid" operator="eq" value="${eventId}" />
          <condition attribute="createdon" operator="le" value="${formattedDateTime}" />
        </filter>
      </entity>
    </fetch>
  `;
    const url = `/_api/wdrgns_events?fetchXml=${encodeURIComponent(fetchXml)}`;
    const response = await fetch(url, {
        headers: { "Accept": "application/json" }
    });
    if (!response.ok) return "";
    const data = await response.json();
    return data.value?.[0]?.wdrgns_event || "";
}

async function fetchPurchasableItemsByEvent(id) {
    const fetchXml = `
    <fetch>
      <entity name="wdrgns_purchasableitem">
      <all-attributes />
        <filter type="and">
          <condition attribute="wdrgns_publishonwebsite" operator="eq" value="101010000" />
          <condition attribute="wdrgns_purchasableitemgroup" operator="eq" value="${id}" />
        </filter>
      </entity>
    </fetch>
  `;
    const url = `/_api/wdrgns_purchasableitems?fetchXml=${encodeURIComponent(fetchXml)}`;
    const response = await fetch(url, {
        headers: { "Accept": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to fetch purchasable items");
    const data = await response.json();
    return data.value;
}

async function fetchTicketType(ticketTypeId) {
    if (!ticketTypeId) return null;
    const fetchXml = `
    <fetch>
      <entity name="wdrgns_tickettype">
        <filter>
          <condition attribute="wdrgns_tickettypeid" operator="eq" value="${ticketTypeId}" />
          <condition attribute="createdon" operator="le" value="${formattedDateTime}" />
        </filter>
      </entity>
    </fetch>
  `;
    const url = `/_api/wdrgns_tickettypes?fetchXml=${encodeURIComponent(fetchXml)}`;
    const response = await fetch(url, {
        headers: { "Accept": "application/json" }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.value?.[0] || null;
}

async function fetchFecilityDescription(facilityId) {
    if (!facilityId) return null;
    const fetchXml = `
    <fetch>
      <entity name="wdrgns_facility">
        <attribute name="wdrgns_description" />
        <filter>
          <condition attribute="wdrgns_facilityid" operator="eq" value="${facilityId}" />
          <condition attribute="createdon" operator="le" value="${formattedDateTime}" />
        </filter>
      </entity>
    </fetch>
  `;
    const url = `/_api/wdrgns_facilities?fetchXml=${encodeURIComponent(fetchXml)}`;
    const response = await fetch(url, {
        headers: { "Accept": "application/json" }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.value?.[0] || null;
}

async function fetchFecilityGroupDescription(facilityGroupId) {
    if (!facilityGroupId) return null;
    const fetchXml = `
    <fetch>
      <entity name="wdrgns_facilitygroup">
        <attribute name="wdrgns_description" />
        <filter>
          <condition attribute="wdrgns_facilitygroupid" operator="eq" value="${facilityGroupId}" />
          <condition attribute="createdon" operator="le" value="${formattedDateTime}" />
        </filter>
      </entity>
    </fetch>
  `;
    const url = `/_api/wdrgns_facilitygroups?fetchXml=${encodeURIComponent(fetchXml)}`;
    const response = await fetch(url, {
        headers: { "Accept": "application/json" }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.value?.[0]?.wdrgns_description || "";
}

async function fetchFacilitiesForFacilityGroup(facilityGroupId) {
    if (!facilityGroupId) return [];

    const fetchXml = `
    <fetch top="50">
      <entity name="wdrgns_facility">
        <attribute name="wdrgns_accessinstructions" />
        <attribute name="wdrgns_description" />
        <attribute name="wdrgns_facility" />
        <attribute name="wdrgns_ingressheight" />
        <attribute name="wdrgns_internalheight" />
        <attribute name="wdrgns_internallength" />
        <attribute name="wdrgns_internalwidth" />
        <attribute name="wdrgns_specialcapabilities" />
        <link-entity name="wdrgns_facilitygroup_wdrgns_facility" from="wdrgns_facilityid" to="wdrgns_facilityid" intersect="true">
          <filter>
            <condition attribute="wdrgns_facilitygroupid" operator="eq" value="${facilityGroupId}" />
          </filter>
        </link-entity>
      </entity>
    </fetch>
  `;

    const url = `/_api/wdrgns_facilities?fetchXml=${encodeURIComponent(fetchXml)}`;
    const response = await fetch(url, {
        headers: { "Accept": "application/json" }
    });

    if (!response.ok) return [];

    const data = await response.json();
    return (data.value || []).map(facility => ({
        wdrgns_facility: facility.wdrgns_facility,
        wdrgns_description: facility.wdrgns_description,
        wdrgns_internalheight: facility.wdrgns_internalheight,
        wdrgns_internallength: facility.wdrgns_internallength,
        wdrgns_internalwidth: facility.wdrgns_internalwidth,
        wdrgns_ingressheight: facility.wdrgns_ingressheight,
        wdrgns_accessinstructions: facility.wdrgns_accessinstructions,
        wdrgns_specialcapabilities: facility.wdrgns_specialcapabilities,
    }));
}

async function fetchCouponGroup(couponGroupId) {
    if (!couponGroupId) return [];
    const fetchXml = `
    <fetch top="50">
      <entity name="wdrgns_coupongroup">
        <attribute name="wdrgns_coupon1id" />
        <attribute name="wdrgns_coupon1quantity" />
        <attribute name="wdrgns_coupon2id" />
        <attribute name="wdrgns_coupon2quantity" />
        <attribute name="wdrgns_coupon3id" />
        <attribute name="wdrgns_coupon3quantity" />
        <attribute name="wdrgns_coupon4id" />
        <attribute name="wdrgns_coupon4quantity" />
        <attribute name="wdrgns_groupname" />
        <filter>
          <condition attribute="wdrgns_coupongroupid" operator="eq" value="${couponGroupId}" />
          <condition attribute="createdon" operator="le" value="${formattedDateTime}" />
        </filter>
      </entity>
    </fetch>
  `;
    const url = `/_api/wdrgns_coupongroups?fetchXml=${encodeURIComponent(fetchXml)}`;
    const response = await fetch(url, {
        headers: { "Accept": "application/json" }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.value?.[0] || {};
}

async function fetchVehiclesInPurchasableItem(categoryId) {
    if (!categoryId) return [];
    const fetchXmlVehicleType = `
    <fetch>
      <entity name="wdrgns_vehicletype">
        <link-entity name="wdrgns_racecategory_wdrgns_vehicletype" from="wdrgns_vehicletypeid" to="wdrgns_vehicletypeid" intersect="true">
          <filter>
            <condition attribute="wdrgns_racecategoryid" operator="eq" value="${categoryId}" />
          </filter>
        </link-entity>
      </entity>
    </fetch>
  `;
    const url = `/_api/wdrgns_vehicletypes?fetchXml=${encodeURIComponent(fetchXmlVehicleType)}`;
    const response = await fetch(url, {
        headers: { "Accept": "application/json" }
    });
    if (!response.ok) return [];
    const data = await response.json();

    const fetchXmlVehicle = `
    <fetch>
      <entity name="wdrgns_vehicle">
        <filter type="and">
          <condition attribute="wdrgns_nominatedvehicletypeid" operator="eq" value="${data.value?.[0].wdrgns_vehicletypeid}" />
          <condition attribute="wdrgns_ownerid" operator="eq" value="${userId}" />
        </filter>
      </entity>
    </fetch>
  `;
    const urlVehicles = `/_api/wdrgns_vehicles?fetchXml=${encodeURIComponent(fetchXmlVehicle)}`;
    const responseVehicles = await fetch(urlVehicles, {
        headers: { "Accept": "application/json" }
    });
    if (!responseVehicles.ok) return [];
    const dataVehicles = await responseVehicles.json();
    return dataVehicles.value;
}

async function fetchLicencetype(categoryId) {
    if (!categoryId) return [];
    const fetchXmlLicenceType = `
    <fetch>
      <entity name="wdrgns_licencetype">
        <link-entity name="wdrgns_racecategory_wdrgns_licencetype" from="wdrgns_licencetypeid" to="wdrgns_licencetypeid" intersect="true">
          <filter>
            <condition attribute="wdrgns_racecategoryid" operator="eq" value="${categoryId}" />
          </filter>
        </link-entity>
      </entity>
    </fetch>
  `;
    const url = `/_api/wdrgns_licencetypes?fetchXml=${encodeURIComponent(fetchXmlLicenceType)}`;
    const response = await fetch(url, {
        headers: { "Accept": "application/json" }
    });
    if (!response.ok) return [];
    const data = await response.json();
    const fetchXmlLicence = `
    <fetch>
      <entity name="wdrgns_licence">
        <filter>
          <condition attribute="wdrgns_contactid" operator="eq" value="${userId}" />
        </filter>
        <link-entity name="wdrgns_licencetype" from="wdrgns_licencetypeid" to="wdrgns_licencetypeid">
          <filter>
            <condition attribute="wdrgns_licencetypeid" operator="eq" value="${data.value?.[0].wdrgns_licencetypeid}" />
          </filter>
        </link-entity>
      </entity>
    </fetch>
  `;
    const urlLicence = `/_api/wdrgns_licences?fetchXml=${encodeURIComponent(fetchXmlLicence)}`;
    const responseVehicles = await fetch(urlLicence, {
        headers: { "Accept": "application/json" }
    });
    if (!responseVehicles.ok) return [];
    const dataLicence = await responseVehicles.json();
    return dataLicence.value;
}


async function fetchTermsAndConditions(purchasableItemId) {
    if (!purchasableItemId) return [];
    const fetchXml = `
    <fetch>
      <entity name="wdrgns_termsandconditions">
        <attribute name="wdrgns_acceptancetext" />
        <attribute name="wdrgns_body" />
        <attribute name="wdrgns_clickablelink" />
        <attribute name="wdrgns_clickablelinktext" />
        <attribute name="wdrgns_displaylocation" />
        <attribute name="wdrgns_displayname" />
        <link-entity name="wdrgns_termsandconditions_wdrgns_purchaseitem" from="wdrgns_termsandconditionsid" to="wdrgns_termsandconditionsid" intersect="true">
          <filter>
            <condition attribute="wdrgns_purchasableitemid" operator="eq" value="${purchasableItemId}" />
          </filter>
        </link-entity>
      </entity>
    </fetch>
  `;
    const url = `/_api/wdrgns_termsandconditionses?fetchXml=${encodeURIComponent(fetchXml)}`;
    const response = await fetch(url, {
        headers: { "Accept": "application/json" }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.value;
}

async function fetchBoookingsInEvent(eventId) {
    if (!eventId) return [];
    const fetchXml = `
    <fetch top="50">
      <entity name="wdrgns_booking">
        <attribute name="wdrgns_bookingid" />
        <attribute name="wdrgns_contactid" />
        <filter>
          <condition attribute="wdrgns_eventid" operator="eq" value="${eventId}" />
          <condition attribute="createdon" operator="le" value="${formattedDateTime}" />
        </filter>
      </entity>
    </fetch>
  `;
    const url = `/_api/wdrgns_bookings?fetchXml=${encodeURIComponent(fetchXml)}`;
    const response = await fetch(url, {
        headers: { "Accept": "application/json" }
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.value;
}

async function fetchContactForBooking(contactId) {
    if (!contactId) return {};
    const fetchXml = `
    <fetch>
      <entity name="contact">
        <attribute name="fullname" />
        <filter>
          <condition attribute="contactid" operator="eq" value="${contactId}" />
          <condition attribute="createdon" operator="le" value="${formattedDateTime}" />
        </filter>
      </entity>
    </fetch>
  `;
    const url = `/_api/contacts?fetchXml=${encodeURIComponent(fetchXml)}`;
    const response = await fetch(url, {
        headers: { "Accept": "application/json" }
    });
    if (!response.ok) return {};
    const data = await response.json();
    return data.value?.[0] || {};
}

async function fetchNoOfDaughter(purchasableItemId) {
    if (!purchasableItemId) return {};
    const fetchXml = `
    <fetch aggregate="true">
      <entity name="wdrgns_purchasableitem">
        <attribute name="createdon" alias="recordCount" aggregate="count" />
        <filter>
          <condition attribute="wdrgns_masteritemid" operator="eq" value="${purchasableItemId}" />
        </filter>
      </entity>
    </fetch>
  `;
    const url = `/_api/wdrgns_purchasableitems?fetchXml=${encodeURIComponent(fetchXml)}`;
    const response = await fetch(url, {
        headers: { "Accept": "application/json" }
    });
    if (!response.ok) return {};
    const data = await response.json();
    return data.value?.[0].recordCount;
}

//---------------- Render fetched Items ------------------

async function renderPurchasableItems(items) {

    let masterArray = [];
    let daughterArray = [];
    let simpleItemArray = []

    const masterArrayOrder = [
        {
            title: 'Mandatory',
            value: 101010001
        },
        {
            title: 'Mandatory if another item selected',
            value: 101010002
        },
        {
            title: 'Unavailable if another item selected',
            value: 101010004
        },
        {
            title: 'Optional',
            value: 10101000
        },
    ]

    const daughterArrayOrder = [
        {
            title: 'Mandatory if another item selected',
            value: 101010002
        },
        {
            title: 'Available if another item selected',
            value: 101010003
        },
    ]

    masterArrayOrder.forEach((masterItem) => {
        items.forEach((item) => {
            if (masterItem.value == item.purchaseRequirement) {
                if (item.category === 'Master') {
                    masterArray.push(item)
                }
            }
        })
    })

    daughterArrayOrder.forEach((daughterItem) => {
        items.forEach((item) => {
            if (daughterItem.value == item.purchaseRequirement) {
                if (item.category === 'Daughter') {
                    daughterArray.push(item)
                }
            }
        })
    })


    items.forEach((item) => {
        if (item.category === 'Simple') {
            simpleItemArray.push(item);
        }
    });



    const container = document.getElementById("facility-results");
    container.innerHTML = '';
    let html = '';
    // rendering part

    // Rendering divs
    if (masterArray.length > 0) {
        for (const master of masterArray) {
            const childrenHTML = await Promise.all(daughterArray.map(async (daughter) => {
                const purchasableTable = `
    <table>
      ${daughter.ticketType ? `
        <tr><th>Ticket type</th><td>${daughter.ticketType.wdrgns_tickettype || '-'}</td></tr>
        <tr><th>Race Category Id</th><td>${daughter.receCategoryId || '-'}</td></tr>
      ` : ''}
      ${daughter.facility ? `
        <tr><th>Facility Description</th><td>${daughter.facility.wdrgns_description || '-'}</td></tr>
      ` : ''}
      ${daughter.facilityGroup ? `
        <tr><th>Facility Group Description</th><td>${daughter.facilityGroup || "-"}</td></tr>
      ` : ''}
      ${daughter.couponGroup ? `
        <tr><th>Coupon Group name</th><td>${daughter.couponGroup.wdrgns_groupname || '-'}</td></tr>
        <tr><th>Coupon one quantity</th><td>${daughter.couponGroup.wdrgns_coupon1quantity || '-'}</td></tr>
        <tr><th>Coupon one name</th><td>${daughter.couponGroup["_wdrgns_coupon1id_value@OData.Community.Display.V1.FormattedValue"] || '-'}</td></tr>
        <tr><th>Coupon two quantity</th><td>${daughter.couponGroup.wdrgns_coupon2quantity || '-'}</td></tr>
        <tr><th>Coupon two name</th><td>${daughter.couponGroup["_wdrgns_coupon2id_value@OData.Community.Display.V1.FormattedValue"] || '-'}</td></tr>
        <tr><th>Coupon three quantity</th><td>${daughter.couponGroup.wdrgns_coupon3quantity || '-'}</td></tr>
        <tr><th>Coupon three name</th><td>${daughter.couponGroup["_wdrgns_coupon3id_value@OData.Community.Display.V1.FormattedValue"] || '-'}</td></tr>
        <tr><th>Coupon four quantity</th><td>${daughter.couponGroup.wdrgns_coupon4quantity || '-'}</td></tr>
        <tr><th>Coupon four name</th><td>${daughter.couponGroup["_wdrgns_coupon4id_value@OData.Community.Display.V1.FormattedValue"] || '-'}</td></tr>
      ` : ''}
    </table>`;

                let facilitiesTable = '';
                if (daughter.facilitiesInGroup?.length > 0) {
                    facilitiesTable = `
      <h4>Facilities In Group:</h4>
        <select class="form-control" style="background-color: transparent !important">
          <option selected disabled value="">Select your Pit-Lane</option>
          ${daughter.facilitiesInGroup.map(elm => `<option value="">${elm.wdrgns_facility}</option>`).join("")
                        }
        </select>
      `;
                }

                let vehicleTypeTable = '';
                if (daughter.vehicleTypes?.length > 0) {
                    vehicleTypeTable = `
      <h4>Vehicle Types:</h4>
        ${daughter.vehicleTypes.map(vehicleType => `
            <div class="vehicleDetailsContainer">
              <input type="checkbox">
              <span>
                  <span class="vehicleName">${vehicleType.wdrgns_primaryidentifier || '-'}</span>
                  <span class="vehicleDetails">${vehicleType["_wdrgns_nominatedvehicletypeid_value@OData.Community.Display.V1.FormattedValue"] || '-'}</span>
              </span>
          </div>
      `).join('')}
      `;
                }

                let termsAndConditionsTable = '';
                if (daughter.termsAndConditions?.length > 0) {
                    termsAndConditionsTable = `
      <h4>Terms & Conditions:</h4>
      <table><thead><tr><th>Display name</th><th>Display location</th><th>Body</th><th>Clickable Link</th><th>Clickable Link Text</th><th>Acceptance Text</th></tr></thead><tbody>
        ${daughter.termsAndConditions.map(termsAndCondition => `
          <tr>
            <td>${termsAndCondition.wdrgns_displayname || '-'}</td>
            <td>${termsAndCondition["wdrgns_displaylocation@OData.Community.Display.V1.FormattedValue"] || '-'}</td>
            <td>${termsAndCondition.wdrgns_body || '-'}</td>
            <td>${termsAndCondition.wdrgns_clickablelink || '-'}</td>
            <td>${termsAndCondition.wdrgns_clickablelinktext || '-'}</td>
            <td>${termsAndCondition.wdrgns_acceptancetext || '-'}</td>
          </tr>`).join('')}
      </tbody></table>`;
                }

                let bookingsTable = '';
                if (daughter.bookings?.length > 0) {
                    bookingsTable = `
      <h4>Bookings:</h4>
      <table><thead><tr><th>First name</th></tr></thead><tbody>`;
                    for (const booking of daughter.bookings) {
                        const contact = await fetchContactForBooking(booking._wdrgns_contactid_value);
                        bookingsTable += `<tr><td>${contact.fullname || '-'}</td></tr>`;
                    }
                    bookingsTable += '</tbody></table>';
                }

                return `
    <div class="childTabs my-2">
      <div class="row">
        <div class="col-10 pt-2 pl-5">
          <div class="childHeader">${daughter.purchasableItem || '-'}</div>
          <div class="childDesc">Price : $${daughter.price || '-'}</div>
          <div class="childDesc">Quantity : ${daughter.quantity || '-'}</div>
        </div>
        <div class="col-md-2 d-flex action justify-content-center">
          <input type="checkbox" class="form-check">
        </div>
        <div class="col-12">${purchasableTable + facilitiesTable + vehicleTypeTable + bookingsTable + termsAndConditionsTable}</div>
      </div>
    </div>`;
            }));



            // rendering masterDiv and inserting the child div into it 
            html += `
                <div class="itemContainer">
                    <button class="btn acccordianBtn">
                        <div>${master.purchasableItem || '-'}</div>
                        <input type="checkbox" class="form-check masterCheckBox">
                    </button>
                    <div class="childItems">
                        ${childrenHTML.join('')}
                    </div>
                </div>
            `;
        };
    }
    if (simpleItemArray.length > 0) {
        simpleItemArray.map((elm) => {

            html += `
             <div class="simpleItemDiv mt-2">
                    <div class="row">
                        <div class="col-2 d-none justify-content-center">
                            <img src="dummy.jfif" alt="" class="img-fluid">
                        </div>
                        <div class="col-9 ps-3 pt-2 my-auto">${elm.purchasableItem}</div>
                        <div class="col-3">
                            <div class="price">$ ${elm.price.toFixed(2)}</div>
                            <div class="action d-flex justify-content-center">
                                <button class="btn my-auto text-secondary" onClick="handleDecrement(this)">-</button>
                                <input type="text" class="form-check my-auto" min="0" max="10" value="0">
                                <button class="btn my-auto text-danger" onClick="handleIncrement(this)">+</button>
                            </div>
                        </div>
                    </div>
                </div>
        `
        })
    }
    // Inject into DOM
    container.innerHTML = html;
}


document.addEventListener('change', function (e) {
    if (e.target.matches('.masterCheckBox')) {
        const checkbox = e.target;

        // Find the parent .itemContainer
        const itemContainer = checkbox.closest('.itemContainer');
        if (!itemContainer) return;

        // Find the .childItems inside that container
        const childItems = itemContainer.querySelector('.childItems');
        if (!childItems) return;

        // Show/hide based on checkbox state
        childItems.style.display = checkbox.checked ? 'block' : 'none';
    }
});


function handleDecrement(button) {
    // // console.log(button);
    if (button.parentNode.children[1].value == 0) return
    button.parentNode.children[1].value = Number(button.parentNode.children[1].value) - 1
}

function handleIncrement(button) {
    // // console.log(button);
    if (button.parentNode.children[1].value == 10) return
    button.parentNode.children[1].value = Number(button.parentNode.children[1].value) + 1
}





// ========================================================
// ========================================================

// (async () => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const id = urlParams.get('id');
//   let eventId = null;
//   try {
//     const purchasableItemsGroup = await fetchPurchasableItemsGroup(id);
//     eventId = purchasableItemsGroup._wdrgns_event_value;
//     const eventName = await fetchEventName(purchasableItemsGroup._wdrgns_event_value);
//     const items = await fetchPurchasableItemsByEvent(id);

//     const finalResults = [];

//     for (const item of items) {
//       // console.log(item);
//       let noOfDaughter = 0;
//       noOfDaughter = await fetchNoOfDaughter(item.wdrgns_purchasableitemid);
//       // console.log("No of Daughter :", noOfDaughter);

//       let receCategoryId = item?._wdrgns_racecategoryid_value || "";
//       let category = null;
//       let itemId = null;
//       if (item._wdrgns_masteritemid_value == null && noOfDaughter == 0 && item.wdrgns_purchaserequirements !== 101010004) {
//         category = "Simple";
//         itemId = item.wdrgns_purchasableitemid;
//       } else if (item._wdrgns_masteritemid_value != null && item.wdrgns_purchaserequirements != 101010004) {
//         category = "Daughter";
//         itemId = item._wdrgns_masteritemid_value
//       } else if (item._wdrgns_masteritemid_value == null && noOfDaughter >= 0 || item.wdrgns_purchaserequirements == 101010004) {
//         category = "Master"
//       }
//       const result = {
//         category: category,
//         itemId: itemId,
//         purchasableItem: item.wdrgns_purchasableitem,
//         purchaseRequirement: item.wdrgns_purchaserequirements,
//         description: item.wdrgns_description,
//         price: item.wdrgns_price,
//         quantity: item.wdrgns_quantity,
//         eventId: item._wdrgns_eventid_value,
//         eventName,
//         itemTypeToBePurchased: item.wdrgns_itemtypetobepurchased,
//         receCategoryId: receCategoryId,
//         ticketType: null,
//         facility: null,
//         facilityGroup: null,
//         facilitiesInGroup: [],
//         couponGroup: null,
//         vehicleTypes: [],
//         bookings: [],
//         licence: [],
//         termsAndConditions: []
//       };

//       if (item.wdrgns_itemtypetobepurchased === 101010000) {
//         result.ticketType = await fetchTicketType(item._wdrgns_tickettype_value);
//       } else if (item.wdrgns_itemtypetobepurchased === 101010001) {
//         result.facility = await fetchFecilityDescription(item._wdrgns_facilityid_value);
//       } else if (item.wdrgns_itemtypetobepurchased === 101010002) {
//         result.facilityGroup = await fetchFecilityGroupDescription(item._wdrgns_facilitygroupid_value);
//         result.facilitiesInGroup = await fetchFacilitiesForFacilityGroup(item._wdrgns_facilitygroupid_value);
//       } else if (item.wdrgns_itemtypetobepurchased === 948090000) {
//         result.couponGroup = await fetchCouponGroup(item._wdrgns_coupongroupid_value);
//       }

//       result.vehicleTypes = await fetchVehiclesInPurchasableItem(receCategoryId);

//       result.licence = await fetchLicencetype(receCategoryId);

//       result.bookings = await fetchBoookingsInEvent(eventId);

//       result.termsAndConditions = await fetchTermsAndConditions(item.wdrgns_purchasableitemid);
//       // console.log("Terms & conditions : ", result.termsAndConditions);


//       finalResults.push(result);
//     }

//     // console.log(finalResults);
//     await renderPurchasableItems(finalResults);
//     document.getElementById("loading").innerText = "";
//   } catch (err) {
//     console.error(err);
//     document.getElementById("loading").innerText = `Error: ${err.message}`;
//   }
// })();

(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    let eventId = null;

    try {
        const purchasableItemsGroup = await fetchPurchasableItemsGroup(id);
        eventId = purchasableItemsGroup._wdrgns_event_value;

        // Fetch event name & items in parallel
        const [eventName, items] = await Promise.all([
            fetchEventName(eventId),
            fetchPurchasableItemsByEvent(id)
        ]);

        // Pre-fetch bookings once (instead of per item)
        const bookings = await fetchBoookingsInEvent(eventId);

        // Map items → Promise array for parallel processing
        const finalResults = await Promise.all(
            items.map(async (item) => {
                const noOfDaughterPromise = fetchNoOfDaughter(item.wdrgns_purchasableitemid);
                const receCategoryId = item?._wdrgns_racecategoryid_value || "";

                let category = null;
                let itemId = null;

                const noOfDaughter = await noOfDaughterPromise;

                if (item._wdrgns_masteritemid_value == null && noOfDaughter === 0 && item.wdrgns_purchaserequirements !== 101010004) {
                    category = "Simple";
                    itemId = item.wdrgns_purchasableitemid;
                } else if (item._wdrgns_masteritemid_value != null && item.wdrgns_purchaserequirements !== 101010004) {
                    category = "Daughter";
                    itemId = item._wdrgns_masteritemid_value;
                } else if (item._wdrgns_masteritemid_value == null && noOfDaughter >= 0 || item.wdrgns_purchaserequirements === 101010004) {
                    category = "Master";
                }

                // Parallel fetches for each item
                const [
                    ticketType,
                    facility,
                    facilityGroup,
                    facilitiesInGroup,
                    couponGroup,
                    vehicleTypes,
                    licence,
                    termsAndConditions
                ] = await Promise.all([
                    item.wdrgns_itemtypetobepurchased === 101010000 ? fetchTicketType(item._wdrgns_tickettype_value) : null,
                    item.wdrgns_itemtypetobepurchased === 101010001 ? fetchFecilityDescription(item._wdrgns_facilityid_value) : null,
                    item.wdrgns_itemtypetobepurchased === 101010002 ? fetchFecilityGroupDescription(item._wdrgns_facilitygroupid_value) : null,
                    item.wdrgns_itemtypetobepurchased === 101010002 ? fetchFacilitiesForFacilityGroup(item._wdrgns_facilitygroupid_value) : [],
                    item.wdrgns_itemtypetobepurchased === 948090000 ? fetchCouponGroup(item._wdrgns_coupongroupid_value) : null,
                    fetchVehiclesInPurchasableItem(receCategoryId),
                    fetchLicencetype(receCategoryId),
                    fetchTermsAndConditions(item.wdrgns_purchasableitemid)
                ]);

                return {
                    category,
                    itemId,
                    purchasableItem: item.wdrgns_purchasableitem,
                    purchaseRequirement: item.wdrgns_purchaserequirements,
                    description: item.wdrgns_description,
                    price: item.wdrgns_price,
                    quantity: item.wdrgns_quantity,
                    eventId: item._wdrgns_eventid_value,
                    eventName,
                    itemTypeToBePurchased: item.wdrgns_itemtypetobepurchased,
                    receCategoryId,
                    ticketType,
                    facility,
                    facilityGroup,
                    facilitiesInGroup,
                    couponGroup,
                    vehicleTypes,
                    bookings, // pre-fetched
                    licence,
                    termsAndConditions
                };
            })
        );

        // console.log(finalResults);
        await renderPurchasableItems(finalResults);
        document.getElementById("loading").innerText = "";
    } catch (err) {
        // console.error(err);
        document.getElementById("loading").innerText = `Error: ${err.message}`;
    }
})();


