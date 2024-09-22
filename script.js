let params = new URLSearchParams(window.location.search);
const unlockedSystems = ["dnd", "pf"];
let system = params.get("system"); // return dnd, pf, ep etc.
let searchTerm = params.get("searchTerm"); //custom search
let urlName = params.get("name"); // return commoner, goblin, splicer etc.
let tags = params.get("tags");
const seperator1 = "*";
const seperator2 = "~";
var imageFound = false;
let tagArrays = [];

if (
  system == null ||
  system.length < 1 ||
  unlockedSystems.indexOf(system) < 0
) {
  system = "dnd";
}
document.title = `Too-Many-Tokens-${system.toUpperCase()}`;

if (searchTerm == null || searchTerm.length < 1) {
  searchTerm = "";
}

if (searchTerm.length > 0) {
  urlName = ""; //if custom search, no specific monster
  searchAll();
}

if (tags == null) {
} else if (tags.length > 0) {
  tags.split(seperator2).forEach((part) => {
    tagArrays.push(part.split(seperator1));
  });
}

const halfOrcString = "HalfOrc";
const halfElfString = "HalfElf";
const nsfwString = "NSFW";
const halfOrcReplacementString = "Halforc";
const halfElfReplacementString = "Halfelf";
const nsfwReplacementString = "Nsfw";

function setUrl() {
  var url = `index.html?system=${system}`;
  if (searchTerm.length >= 3) {
    url += `&searchTerm=${searchTerm}`;
  } else if (urlName.length > 0) {
    url += `&name=${urlName}`;
  }
  //Tags into URL
  var tags = generateTags();
  if (tags.length > 0) {
    url += `&tags=${tags}`;
  }
  history.pushState(null, null, url);
}

function showDropdown(shouldShow, force = false) {
  if (shouldShow) {
    document.getElementById("txtFilesSearch").style.display = "";
  } else if (
    force ||
    !document.getElementById("txtFilesSearch").matches(":hover")
  ) {
    document.getElementById("txtFilesSearch").style.display = "none";
  }
}
// Define the base URL for image paths
var baseUrl;
if (system == "dnd") {
  baseUrl = `https://raw.githubusercontent.com/IsThisMyRealName/too-many-tokens-${system}/main/`;
} else {
  baseUrl = `https://raw.githubusercontent.com/IsThisMyRealName/too-many-tokens-${system}/main/Tokens/`;
}

// Function to fetch image paths from a selected .txt file
async function fetchImagePaths(fileName) {
  const response = await fetch(`${system}/${fileName}`);
  const lines = await response.text();
  return lines.split("\n").filter((line) => line.trim().endsWith(".webp"));
}

async function fetchImagePaths(fileName) {
  const response = await fetch(`${system}/${fileName}`);
  const lines = await response.text();
  return lines.split("\n").filter((line) => line.trim().endsWith(".webp"));
}

async function searchAll() {
  if (searchTerm.length < 3) {
    console.error("Please search for at least 3 characters");
    return;
  }

  const foundNames = new Map();
  const txtFiles = await fetchTxtFiles();
  document.getElementById("searchAll").value = searchTerm;

  let totalImagesFound = 0;
  // const countDisplay = document.getElementById("imageCount");
  // countDisplay.textContent = `Images found: ${totalImagesFound}`;
  console.log(`Images found: ${totalImagesFound}`);

  // Process files in parallel using Promise.all
  await Promise.all(
    txtFiles.map(async (fileName) => {
      const imagePaths = await fetchImagePaths(`${fileName}.txt`);
      let matchedImagePaths = [];

      if (new RegExp(searchTerm, "i").test(fileName)) {
        matchedImagePaths = imagePaths;
      } else {
        matchedImagePaths = imagePaths.filter((path) =>
          new RegExp(searchTerm, "i").test(path)
        );
      }

      if (matchedImagePaths.length > 0) {
        foundNames.set(fileName, matchedImagePaths);
        totalImagesFound += matchedImagePaths.length;
        // countDisplay.textContent = `Images found: ${totalImagesFound}`;
        console.log(`Images found: ${totalImagesFound}`);
      }
    })
  );

  clearImages();

  if (foundNames.size > 0) {
    for (const [key, value] of foundNames.entries()) {
      addImagesFromPaths(value, key);
      showOptionToggles(value);
    }
    urlName = "";
    document.getElementById("myInput").value = urlName;
    setUrl();
  } else {
    showHeader(`No images found for search term "${searchTerm}"`);
  }

  showDownloadButton();
  // countDisplay.textContent = `Search complete. Total images found: ${totalImagesFound}`;
  console.log(`Images found: ${totalImagesFound}`);
}

function clearImages() {
  const imagesContainer = document.getElementById("imagesContainer");
  imagesContainer.innerHTML = ""; // Clear previous images
  imageFound = false;
}

function showHeader(fileName, parent = null) {
  const imagesContainer = document.getElementById("imagesContainer");
  // Create and append header element
  const header = document.createElement("h2");
  header.textContent = fileName;
  if (parent == null) {
    imagesContainer.appendChild(header);
  } else {
    parent.appendChild(header);
  }
}

function addImagesFromPaths(imagePaths, fileName) {
  if (imagePaths.length > 0) imageFound = true;
  const imagesContainer = document.getElementById("imagesContainer");
  const container = document.createElement(`imagesSubContainer`);
  const headerRow = document.createElement("headerRow");

  container.classList.add(["images-container"]);
  headerRow.classList.add(["header-row"]);

  imagesContainer.appendChild(container);
  container.appendChild(headerRow);
  const toggleButton = document.createElement("toggleButton");
  toggleButton.classList = ["toggle-button"];
  headerRow.appendChild(toggleButton);
  toggleButton.addEventListener("click", function () {
    toggleButton.classList.toggle("open");
    container.classList.toggle("minimized");
  });

  showHeader(fileName, headerRow);
  imagePaths.forEach((path) => {
    const img = document.createElement("img");
    img.src = baseUrl + fileName.replace(" ", "%20") + "/" + path;
    img.title = path;
    img.width = 256;
    img.height = 256;
    img.style = "background-color: #333";
    img.onclick = function () {
      copyImageLink(img.src);
    };
    container.appendChild(img);
    toggleDropdownShow(false);
    showDropdown(false, true);
  });
  showDownloadButton();
}

// Function to display images
async function showImages() {
  const selectedFileName = document.getElementById("myInput").value;
  const imagePaths = await fetchImagePaths(`${selectedFileName}.txt`);
  clearImages();
  // showHeader(selectedFileName);
  addImagesFromPaths(imagePaths, selectedFileName);
  showOptionToggles(imagePaths);

  // Hide loading spinner and enable input
  document.getElementById("loadingSpinner").style.display = "none";
  document.getElementById("myInput").disabled = false;
  urlName = selectedFileName;
  searchTerm = "";
  document.getElementById("searchAll").value = "";
  setUrl();
}

function showDownloadButton() {
  if (imageFound) {
    // Show the download button if images are shown
    document.getElementById("downloadImagesBtn").style.display = "block";
    urlName = document.getElementById("myInput").value;
  } else {
    document.getElementById("downloadImagesBtn").style.display = "none";
  }
}

function replaceAfterFirstDragonborn(inputString) {
  const index = inputString.indexOf("Dragonborn");
  if (index !== -1) {
    return inputString.substring(0, index + "Dragonborn".length);
  }
  return inputString;
}

// Function to display options
function showOptionToggles(imagePaths) {
  // Separate unique names into lists based on their position in the file name and remove the actor name
  const nameLists = new Map();
  const selectedMonsterName = document.getElementById("myInput").value;
  const selectedMonsterNameWithoutSpaces = selectedMonsterName
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .replace(/\s/g, "");
  const fullNamesList = imagePaths.map((file) => {
    const fileName = file.split("/").pop(); // Get the file name
    const actorNameWithoutSpaces = fileName.split(" ")[0]; // Get actor name without spaces
    const cleanFileName = actorNameWithoutSpaces.replace(/\(.*$/, ""); // Remove everything from the first open bracket
    const cleanFileNameWithoutDragonbornOptions = cleanFileName.includes(
      "Dragonborn"
    )
      ? replaceAfterFirstDragonborn(actorNameWithoutSpaces)
      : cleanFileName;
    return cleanFileNameWithoutDragonbornOptions;
  });

  fullNamesList.forEach((file) => {
    const fileNameParts = [selectedMonsterName];
    file = file
      .replace(selectedMonsterNameWithoutSpaces, "")
      .replace(halfOrcString, halfOrcReplacementString)
      .replace(halfElfString, halfElfReplacementString)
      .replace(nsfwString, nsfwReplacementString);
    fileNameParts.push(
      ...file
        .split(/(?=[A-Z])/)
        .filter(Boolean)
        .map((part) => part)
    );

    fileNameParts.forEach((part, index) => {
      if (!nameLists.has(index)) {
        nameLists.set(index, new Set());
      }

      nameLists
        .get(index)
        .add(
          part
            .replace(halfElfReplacementString, halfElfString)
            .replace(halfOrcReplacementString, halfOrcString)
            .replace(nsfwReplacementString, nsfwString)
        );
    });
  });

  const container = document.getElementById("checkboxContainer");
  container.innerHTML = ""; // Clear previous checkboxes
  container.style = "display: flex";
  var isFirst = true;
  var optionIndex = -1;
  nameLists.forEach((options) => {
    const checkboxSubcontainer = document.createElement("div");
    checkboxSubcontainer.className = "CheckboxSubContainer";
    //Create Any Checkbox
    const checkbox = document.createElement("input");
    const label = document.createElement("label");
    checkbox.type = "checkbox";
    if (isFirst) {
      checkbox.id = selectedMonsterNameWithoutSpaces;
      checkbox.value = selectedMonsterNameWithoutSpaces;
      label.htmlFor = selectedMonsterNameWithoutSpaces;
      label.appendChild(document.createTextNode(selectedMonsterName));
      checkbox.checked = true;
    } else {
      optionIndex++;
      checkbox.id = "Any";
      checkbox.value = "Any";
      label.htmlFor = "Any";
      label.appendChild(document.createTextNode("Any"));
      //If an a tag is set via the URL don't check any-checkbox
      if (
        Array.isArray(tagArrays) &&
        tagArrays.length > optionIndex &&
        tagArrays[optionIndex].length > 0
      ) {
        checkbox.checked = false;
      } else {
        checkbox.checked = true;
      }
    }

    checkboxSubcontainer.appendChild(checkbox);
    checkboxSubcontainer.appendChild(label);
    checkboxSubcontainer.appendChild(document.createElement("br"));
    container.appendChild(checkboxSubcontainer);

    if (isFirst) {
      isFirst = false;
      return;
    }

    options.forEach((option) => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = option;
      checkbox.value = option;
      if (
        Array.isArray(tagArrays) &&
        tagArrays.length > optionIndex &&
        tagArrays[optionIndex].length > 0
      ) {
        checkbox.checked = tagArrays[optionIndex].includes(option);
      } else {
        checkbox.checked = true;
      }

      const label = document.createElement("label");
      label.htmlFor = option;
      label.appendChild(document.createTextNode(option));

      checkboxSubcontainer.appendChild(checkbox);
      checkboxSubcontainer.appendChild(label);
      checkboxSubcontainer.appendChild(document.createElement("br"));
    });

    checkboxSubcontainer
      .querySelectorAll("input[type=checkbox]")
      .forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          filterImages();
          setUrl();
        });
      });
  });
  container.childNodes[0].childNodes[0].disabled = true;

  filterImages();
}

function filterImages() {
  const regex = new RegExp(generateRegex());
  const images = document
    .getElementById("imagesContainer")
    .getElementsByTagName("img");

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (img.title.match(regex)) {
      img.style.display = ""; // Show image
    } else {
      img.style.display = "none"; // Hide image
    }
  }
  document.getElementById("wildcardpath").value = createWildcardPath();
  document.getElementById("wildcardpath").style.display = "";
  document.getElementById("copyWildcardButton").style.display = "";
}

function copyWildcardPath() {
  // Select the input field
  const inputField = document.getElementById("wildcardpath");

  // Copy the text inside the input field to the clipboard
  inputField.select();
  document.execCommand("copy");

  // Deselect the input field
  inputField.selectionEnd = inputField.selectionStart;

  // Optionally, provide feedback to the user
  new Notification("Wildcard path copied to clipboard: " + inputField.value);
}

function generateRegex() {
  let regex = "";

  const checkboxContainers = document.querySelectorAll(".CheckboxSubContainer");

  checkboxContainers.forEach((container, index) => {
    const checkedCheckboxes = container.querySelectorAll(
      "input[type='checkbox']:checked"
    );

    if (checkedCheckboxes.length > 0) {
      regex += "(";

      checkedCheckboxes.forEach((checkbox, i) => {
        if (i > 0) {
          regex += "|"; // OR operator
        }
        if (checkbox.value === "Any") {
          regex += ".*"; // Match any text
        } else {
          regex += checkbox.value;
        }
      });

      regex += ")";
    }

    if (index < checkboxContainers.length - 1) {
      regex += ".*"; // Match any text between CheckboxSubContainers
    }
  });

  regex += ""; // End of string anchor

  return new RegExp(regex);
}

function generateTags() {
  let tags = "";
  tagArrays = [];

  const checkboxContainers = document.querySelectorAll(".CheckboxSubContainer");
  checkboxContainers.forEach((container, index) => {
    if (index > 0) {
      const checkedCheckboxes = container.querySelectorAll(
        "input[type='checkbox']:checked"
      );
      let tagArray = [];
      if (checkedCheckboxes.length > 0) {
        for (const checkbox of checkedCheckboxes) {
          if (checkbox.value === "Any") {
            tagArray = [];
            break;
          } else {
            tagArray.push(checkbox.value);
          }
        }
      }
      tagArrays.push(tagArray);
    }
  });
  if (tagArrays.some((e) => e.length > 0)) tags = combineArray(tagArrays);

  return tags;
}

function combineArray(a) {
  return a
    .map((b) => b.join(seperator1)) // Combine elements in each array b with separator1
    .join(seperator2); // Combine the resulting strings with separator2
}

// Function to create a wildcard path based on selected checkboxes
const createWildcardPath = () => {
  let wildcardPath = `modules/too-many-tokens-${system}/${
    document.getElementById("myInput").value
  }/`;
  wildcardPath = wildcardPath.replace(/\*+/g, "*");

  const checkboxContainers = document.querySelectorAll(".CheckboxSubContainer");

  checkboxContainers.forEach((container, index) => {
    let checkedCheckboxesValues = [];
    container
      .querySelectorAll("input[type='checkbox']:checked")
      .forEach((checkbox, index) => {
        checkedCheckboxesValues[index] = checkbox.value;
      });

    if (
      checkedCheckboxesValues.includes("Any") ||
      checkedCheckboxesValues.length <= 0
    ) {
      // If *any is checked, use *
      wildcardPath += "*";
    } else {
      if (checkedCheckboxesValues.length == 1) {
        wildcardPath += `${checkedCheckboxesValues[0]}`;
      } else {
        wildcardPath += `{${checkedCheckboxesValues.join(",")}}`;
      }
    }
  });

  wildcardPath += "*"; // End of string anchor
  wildcardPath = wildcardPath.replace(/\*+/g, "*");

  return wildcardPath;
};

// Initialize dropdown with .txt files
fetchTxtFiles().then((txtFiles) => {
  // const dropdown = document.getElementById("txtFiles");
  const textSearchDropdown = document.getElementById("txtFilesSearch");
  txtFiles.forEach((fileName) => {
    const option = document.createElement("a");
    option.value = fileName;
    option.text = fileName.split(".")[0].replace("%20", " "); // Remove .txt extension

    // dropdown.appendChild(option);
    textSearchDropdown.appendChild(option);
    option.onclick = function () {
      applyTextToInput(option.text);
    };
  });
  toggleDropdownShow(false);
  if (searchTerm != undefined && searchTerm.length >= 3) {
    searchAll();
  } else if (
    urlName != undefined &&
    urlName.length > 0 &&
    txtFiles.indexOf(urlName) >= 0
  ) {
    document.getElementById("myInput").value = urlName;
    showImages();
  }
});

/* When the user clicks on the button,
    toggle between hiding and showing the dropdown content */
function toggleDropdownShow(shouldShow) {
  const textFileSearch = document.getElementById("txtFilesSearch");
  if (shouldShow) {
    document.getElementById("myInput").select();
    filterFunction();
  } else {
    var a = textFileSearch.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
      a[i].style.display = "none";
    }
  }
}

function applyTextToInput(text) {
  document.getElementById("myInput").value = text;
  // Show loading spinner and disable input
  document.getElementById("loadingSpinner").style.display = "block";
  document.getElementById("myInput").disabled = true;
  tagArrays = [];
  showImages();
  document.getElementById("wildcardpath").value = "";
  document.getElementById("wildcardpath").display = "none";
  document.getElementById("copyWildcardButton").display = "none";
}

function filterFunction() {
  var input, filter, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("txtFilesSearch");
  a = div.getElementsByTagName("a");
  toggleDropdownShow(false);
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}

function searchAllFromInput() {
  var input = document.getElementById("searchAll");
  searchTerm = input.value;
  searchAll();
}

// Function to copy the image link
function copyImageLink(imageLink) {
  // Create a temporary input element
  var tempInput = document.createElement("input");

  // Set the input value to the image link
  tempInput.value = imageLink;

  // Append the input element to the body
  document.body.appendChild(tempInput);

  // Select the input element's value
  tempInput.select();

  // Copy the selected value
  document.execCommand("copy");

  // Remove the temporary input element
  document.body.removeChild(tempInput);

  // Optionally, provide feedback to the user
  new Notification("Image link copied to clipboard: " + imageLink);
}

// Function to download images as a zip file
document
  .getElementById("downloadImagesBtn")
  .addEventListener("click", async function () {
    const images = document
      .getElementById("imagesContainer")
      .getElementsByTagName("img");
    const zip = new JSZip();
    // const imgFolder = zip.folder(`images ${document.getElementById("myInput").value}`);

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const imageName = image.title.replace(`\r`, ``);
      const imageUrl = image.src;

      // Only include images that are not set to display="false"
      if (image.style.display !== "none" && image.style.display !== "false") {
        var imageFetch = await fetch(imageUrl);
        var imageBlob = await imageFetch.blob();
        zip.file(imageName, imageBlob, { binary: true });
      }
    }
    var zipName;
    if (searchTerm.length >= 3) zipName = searchTerm;
    else zipName = urlName;
    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${zipName}.zip`);
    });
  });

// Function to fetch .txt files in a folder
async function fetchTxtFiles() {
  const response = await fetch(`names\\${system}.txt`);
  const lines = await response.text();

  const txtFiles = lines.split("\n");
  return txtFiles;
}
