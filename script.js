const halfOrcString = "HalfOrc";
      const halfElfString = "HalfElf";
      const halfOrcReplacementString = "Halforc";
      const halfElfReplacementString = "Halfelf";

    function showDropdown(shouldShow){
      if(shouldShow){
        document.getElementById("txtFilesSearch").style.display = "";
      }
      else{
        document.getElementById("txtFilesSearch").style.display = "none";
      }
    }
    // Define the base URL for image paths
    const baseUrl =
      "https://raw.githubusercontent.com/IsThisMyRealName/too-many-tokens-dnd/main/";

    // Function to fetch image paths from a selected .txt file
    async function fetchImagePaths(fileName) {
      const response = await fetch('link-files/' + fileName);
      const lines = await response.text();
      return lines
        .split("\n")
        .filter((line) => line.trim().endsWith(".webp"));
    }

    // Function to display images
    async function showImages() {
      const selectedFileName = document.getElementById("myInput").value;
      const imagePaths = await fetchImagePaths(`${selectedFileName}.txt`);
      const imagesContainer = document.getElementById("imagesContainer");
      imagesContainer.innerHTML = ""; // Clear previous images

      imagePaths.forEach((path) => {
        const img = document.createElement("img");
        img.src = baseUrl + selectedFileName.replace(" ", "%20") + "/" + path;
        img.title = path;
        img.width = 256;
        img.height = 256;
        img.style = "background-color: #333";
        img.onclick = function () { copyImageLink(img.src) };
        imagesContainer.appendChild(img);
        toggleDropdownShow(false);
        showDropdown(false);
      });
      showOptionToggles(imagePaths);

      

      // Show the download button if images are shown
      if (imagePaths.length > 0) {
        document.getElementById("downloadImagesBtn").style.display = "block";
      } else {
        document.getElementById("downloadImagesBtn").style.display = "none";
      }

      // Hide loading spinner and enable input
      document.getElementById("loadingSpinner").style.display = "none";
      document.getElementById("myInput").disabled = false;
    }

    // Function to display options
      function showOptionToggles(imagePaths) {

        // Separate unique names into lists based on their position in the file name and remove the actor name
        const nameLists = new Map();
        const selectedMonsterName = document.getElementById("myInput").value;
        const selectedMonsterNameWithoutSpaces = selectedMonsterName.replace(/\b\w/g, match => match.toUpperCase()).replace(/\s/g, "");
        const fullNamesList = imagePaths.map(file => {
          const fileName = file.split("/").pop(); // Get the file name
          const actorNameWithoutSpaces = fileName.split(" ")[0]; // Get actor name without spaces
          const cleanFileName = actorNameWithoutSpaces.replace(/\(.*$/, ""); // Remove everything from the first open bracket
          const cleanFileNameWithoutDragonbornOptions = (cleanFileName.includes("Dragonborn"))?"Dragonborn":cleanFileName;
          return cleanFileNameWithoutDragonbornOptions;
        });

        fullNamesList.forEach((file) => {
          const fileNameParts = [selectedMonsterName];
          file = file.replace(selectedMonsterNameWithoutSpaces, "").replace(halfOrcString, halfOrcReplacementString).replace(halfElfString, halfElfReplacementString);
          fileNameParts.push(...file.split(/(?=[A-Z])/).filter(Boolean).map((part) => part));

          fileNameParts.forEach((part, index) => {
            if (!nameLists.has(index)) {
              nameLists.set(index, new Set());
            }
            
            nameLists.get(index).add(part.replace(halfElfReplacementString, halfElfString).replace(halfOrcReplacementString, halfOrcString));
          });
        });

        const container = document.getElementById("checkboxContainer");
        container.innerHTML = ""; // Clear previous checkboxes
        container.style = "display: flex";
        var isFirst = true;
        nameLists.forEach(options =>{
          const checkboxSubcontainer = document.createElement("div");
          checkboxSubcontainer.className = "CheckboxSubContainer";
          //Create Any Checkbox
          const checkbox = document.createElement("input");
          const label = document.createElement("label");
          checkbox.type = "checkbox";
          if(isFirst){
            checkbox.id = selectedMonsterNameWithoutSpaces;
            checkbox.value = selectedMonsterNameWithoutSpaces;
            label.htmlFor = selectedMonsterNameWithoutSpaces;
            label.appendChild(document.createTextNode(selectedMonsterName));
          }
          else{
            checkbox.id = "Any";
            checkbox.value = "Any";
            label.htmlFor = "Any";
            label.appendChild(document.createTextNode("Any"));
          }
          checkbox.checked = true;

          

          checkboxSubcontainer.appendChild(checkbox);
          checkboxSubcontainer.appendChild(label);
          checkboxSubcontainer.appendChild(document.createElement("br"));
          container.appendChild(checkboxSubcontainer);

          if(isFirst){
            isFirst = false;
            return;
          }

          options.forEach(option => {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = option;
            checkbox.value = option;
            checkbox.checked = true;
            
            const label = document.createElement("label");
            label.htmlFor = option;
            label.appendChild(document.createTextNode(option));

            checkboxSubcontainer.appendChild(checkbox);
            checkboxSubcontainer.appendChild(label);
            checkboxSubcontainer.appendChild(document.createElement("br"));
          });

          checkboxSubcontainer.querySelectorAll("input[type=checkbox]").forEach(checkbox => {
            
            checkbox.addEventListener("change", () => {
              
              const regex = new RegExp(generateRegex());
              const images = document.getElementById("imagesContainer").getElementsByTagName("img");

              for (let i = 0; i < images.length; i++) {
                const img = images[i];
                if (img.title.match(regex)) {
                  img.style.display = ""; // Show image
                }
                else {
                  img.style.display = "none"; // Hide image
                }
              }
                document.getElementById("wildcardpath").value = createWildcardPath();
                document.getElementById("wildcardpath").style.display = "";
                document.getElementById("copyWildcardButton").style.display = "";
            });
          });
        });
          container.childNodes[0].childNodes[0].disabled = true;

        
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
            const checkedCheckboxes = container.querySelectorAll("input[type='checkbox']:checked");

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

        // Function to create a wildcard path based on selected checkboxes
          const createWildcardPath = () => {
            let wildcardPath = `modules/too-many-tokens-dnd/${document.getElementById("myInput").value}/`;
            wildcardPath = wildcardPath.replace(/\*+/g, '*');

            const checkboxContainers = document.querySelectorAll(".CheckboxSubContainer");

            checkboxContainers.forEach((container, index) => {
              let checkedCheckboxesValues = [];
              container.querySelectorAll("input[type='checkbox']:checked").forEach((checkbox, index) => {
                checkedCheckboxesValues[index] = (checkbox.value);
              });

                if (checkedCheckboxesValues.includes("Any") || checkedCheckboxesValues.length <= 0) {
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
            wildcardPath = wildcardPath.replace(/\*+/g, '*');

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
        option.onclick = function () { applyTextToInput(option.text) };
      });
      toggleDropdownShow(false);
    });


    /* When the user clicks on the button,
    toggle between hiding and showing the dropdown content */
    function toggleDropdownShow(shouldShow) {
      const textFileSearch = document.getElementById("txtFilesSearch");
      if (shouldShow) {
        document.getElementById("myInput").select();
        filterFunction();
      }
      else {
        
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
        showImages();
        document.getElementById("wildcardpath").value = "";
        document.getElementById("wildcardpath").display = "none";
        document.getElementById("copyWildcardButton").display = "none";
    };

    function filterFunction() {
      var input, filter, ul, li, a, i;
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
    document.getElementById("downloadImagesBtn").addEventListener("click", async function () {
      const images = document.getElementById("imagesContainer").getElementsByTagName("img");
      const zip = new JSZip();
      // const imgFolder = zip.folder(`images ${document.getElementById("myInput").value}`);

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imageName = image.title;
        const imageUrl = image.src;

        // await imgFolder.file(imageName, imageBlob);
        var imageFetch = await fetch(imageUrl)
        var imageBlob = await imageFetch.blob()
        // var img = zip.folder("images");
        // loading a file and add it in a zip file
        zip.file(imageName, imageBlob, { binary: true });
      }

      zip.generateAsync({ type: "blob" })
        .then(content => {
          saveAs(content, `${document.getElementById("myInput").value}.zip`);
        });
    });

    // Function to fetch .txt files in a folder
    async function fetchTxtFiles() {
    const veryStupidHardcodeTextfiles = [
      "Aarakocra",
      "Aboleth",
      "Abominable Yeti",
      "Acolyte",
      "Air Elemental",
      "Allosaurus",
      "Animated Armor",
      "Ankheg",
      "Ankylosaurus",
      "Ape",
      "Assassin",
      "Awakened Shrub",
      "Awakened Tree",
      "Axe Beak",
      "Azer",
      "Baboon",
      "Badger",
      "Bandit Captain",
      "Bandit",
      "Banshee",
      "Barbed Devil",
      "Barlgura",
      "Basilisk",
      "Bat",
      "Bearded Devil",
      "Beholder Zombie",
      "Berserker",
      "Black Bear",
      "Black Dragon Wyrmling",
      "Black Pudding",
      "Blink Dog",
      "Blood Hawk",
      "Blue Dragon Wyrmling",
      "Blue Slaad",
      "Boar",
      "Bone Devil",
      "Bone Naga",
      "Brass Dragon Wyrmling",
      "Bronze Dragon Wyrmling",
      "Brown Bear",
      "Bugbear Chief",
      "Bugbear",
      "Bulette",
      "Bullywug",
      "Cambion",
      "Camel",
      "Carrion Crawler",
      "Cat",
      "Cave Bear",
      "Centaur",
      "Chain Devil",
      "Chasme",
      "Chimera",
      "Chuul",
      "Clay Golem",
      "Cloaker",
      "Cloud Giant",
      "Cockatrice",
      "Commoner",
      "Constrictor Snake",
      "Copper Dragon Wyrmling",
      "Couatl",
      "Crab",
      "Crawling Claw",
      "Crocodile",
      "Cult Fanatic",
      "Cultist",
      "Cyclops",
      "Darkmantle",
      "Death Dog",
      "Death Slaad",
      "Deep Gnome",
      "Deer",
      "Deva",
      "Dire Wolf",
      "Displacer Beast",
      "Doppelganger",
      "Draft Horse",
      "Dretch",
      "Drider",
      "Drow Elite Warrior",
      "Drow Mage",
      "Drow Priestess of Lolth",
      "Drow",
      "Druid",
      "Dryad",
      "Duergar",
      "Duodrone",
      "Dust Mephit",
      "Eagle",
      "Earth Elemental",
      "Elephant",
      "Elk",
      "Ettercap",
      "Ettin",
      "Faerie Dragon",
      "Fire Elemental",
      "Fire Giant",
      "Fire Snake",
      "Flameskull",
      "Flesh Golem",
      "Flumph",
      "Flying Snake",
      "Flying Sword",
      "Fomorian",
      "Frog",
      "Frost Giant",
      "Galeb Duhr",
      "Gargoyle",
      "Gas Spore",
      "Gelatinous Cube",
      "Ghast",
      "Ghost",
      "Ghoul",
      "Giant Ape",
      "Giant Badger",
      "Giant Bat",
      "Giant Boar",
      "Giant Centipede",
      "Giant Constrictor Snake",
      "Giant Crab",
      "Giant Crocodile",
      "Giant Eagle",
      "Giant Elk",
      "Giant Fire Beetle",
      "Giant Frog",
      "Giant Goat",
      "Giant Hyena",
      "Giant Lizard",
      "Giant Octopus",
      "Giant Owl",
      "Giant Poisonous Snake",
      "Giant Rat",
      "Giant Scorpion",
      "Giant Seahorse",
      "Giant Shark",
      "Giant Spider",
      "Giant Toad",
      "Giant Vulture",
      "Giant Wasp",
      "Giant Weasel",
      "Giant Wolf Spider",
      "Gibbering Mouther",
      "Githyanki Knight",
      "Githyanki Warrior",
      "Githzerai Monk",
      "Githzerai Zerth",
      "Glabrezu",
      "Gladiator",
      "Gnoll Fang of Yeenoghu",
      "Gnoll Pack Lord",
      "Gnoll",
      "Goat",
      "Goblin Boss",
      "Goblin",
      "Gold Dragon Wyrmling",
      "Gorgon",
      "Gray Ooze",
      "Gray Slaad",
      "Green Dragon Wyrmling",
      "Green Hag",
      "Green Slaad",
      "Grell",
      "Griffon",
      "Grimlock",
      "Guard",
      "Guardian Naga",
      "Half-Ogre",
      "Harpy",
      "Hawk",
      "Hellhound",
      "Helmed Horror",
      "Hezrou",
      "Hill Giant",
      "Hippogriff",
      "Hobgoblin Captain",
      "Hobgoblin Warlord",
      "Hobgoblin",
      "Homunculus",
      "Hook Horror",
      "Hunter Shark",
      "Hydra",
      "Hyena",
      "Ice Mephit",
      "Imp",
      "Incubus",
      "Intellect Devourer",
      "Invisible Stalker",
      "Jackal",
      "Jackalwere",
      "Kenku",
      "Killer Whale",
      "Knight",
      "Kobold",
      "Kuo-toa Archpriest",
      "Kuo-toa Monitor",
      "Kuo-toa Whip",
      "Kuo-toa",
      "Lamia",
      "Lemure",
      "Lion",
      "Lizard King",
      "Lizard Queen",
      "Lizard",
      "Lizardfolk Shaman",
      "Lizardfolk",
      "Mage",
      "Magma Mephit",
      "Magmin",
      "Mammoth",
      "Manes",
      "Manticore",
      "Mastiff",
      "Medusa",
      "Merfolk",
      "Merrow",
      "Mezzoloth",
      "Mimic",
      "Mindflayer Arcanist",
      "Mindflayer",
      "Minotaur Skeleton",
      "Minotaur",
      "Monodrone",
      "Mud Mephit",
      "Mule",
      "Mummy",
      "Myconid Adult",
      "Myconid Sovereign",
      "Myconid Sprout",
      "Needle Blight",
      "Night Hag",
      "Nightmare",
      "Noble",
      "Nothic",
      "Nycaloth",
      "Ochre Jelly",
      "Octopus",
      "Ogre Zombie",
      "Ogre",
      "Oni",
      "Orc Eye of Gruumsh",
      "Orc War Chief",
      "Orc",
      "Orog",
      "Owl",
      "Owlbear",
      "Packs",
      "Panther",
      "Pegasus",
      "Pentadrone",
      "Peryton",
      "Phase Spider",
      "Piercer",
      "Pixie",
      "Plesiosaurus",
      "Poisonous Snake",
      "Polar Bear",
      "Poltergeist",
      "Pony",
      "Priest",
      "Pseudodragon",
      "Pteranodon",
      "Quadrone",
      "Quaggoth Thonot",
      "Quaggoth",
      "Quasit",
      "Quipper",
      "Rat",
      "Raven",
      "Red Dragon Wyrmling",
      "Red Slaad",
      "Reef Shark",
      "Revenant",
      "Rhinoceros",
      "Riding Horse",
      "Roper",
      "Rug of Smothering",
      "Rust Monster",
      "Saber-Toothed Tiger",
      "Sahuagin Baron",
      "Sahuagin Priestess",
      "Sahuagin",
      "Salamander",
      "Satyr",
      "Scarecrow",
      "Scorpion",
      "Scout",
      "Scripts",
      "Sea Hag",
      "Sea Horse",
      "Shadow Demon",
      "Shadow",
      "Shambling Mound",
      "Shield Guardian",
      "Shrieker",
      "Silver Dragon Wyrmling",
      "Skeleton",
      "Slaad Tadpole",
      "Smoke Mephit",
      "Spectator",
      "Specter",
      "Spider",
      "Spined Devil",
      "Spirit Naga",
      "Sprite",
      "Steam Mephit",
      "Stirge",
      "Stone Giant",
      "Stone Golem",
      "Succubus",
      "Swarm of Bats",
      "Swarm of Beetles",
      "Swarm of Centipedes",
      "Swarm of Insects",
      "Swarm of Poisonous Snakes",
      "Swarm of Quippers",
      "Swarm of Rats",
      "Swarm of Ravens",
      "Swarm of Spiders",
      "Swarm of Wasps",
      "Thri-kreen",
      "Thug",
      "Tiger",
      "Token",
      "Treant",
      "Tribal Warrior",
      "Triceratops",
      "Tridrone",
      "Troglodyte",
      "Troll",
      "Twig Blight",
      "Tyrannosaurus Rex",
      "Umber Hulk",
      "Unicorn",
      "Vampire Spawn",
      "Veteran",
      "Vine Blight",
      "Violet Fungus",
      "Vrock",
      "Vulture",
      "Warhorse Skeleton",
      "Warhorse",
      "Water Elemental",
      "Water Weird",
      "Weasel",
      "Werebear",
      "Wereboar",
      "Wererat",
      "Weretiger",
      "Werewolf",
      "White Dragon Wyrmling",
      "Wight",
      "Will-o'-Wisp",
      "Winged Kobold",
      "Winter Wolf",
      "Wolf",
      "Worg",
      "Wraith",
      "Wyvern",
      "Yeti",
      "Yochol",
      "Young Black Dragon",
      "Young Blue Dragon",
      "Young Brass Dragon",
      "Young Bronze Dragon",
      "Young Copper Dragon",
      "Young Gold Dragon",
      "Young Green Dragon",
      "Young Red Dragon",
      "Young Remorhaz",
      "Young Silver Dragon",
      "Young White Dragon",
      "Yuan-ti Abomination",
      "Yuan-ti Malison (Type 1)",
      "Yuan-ti Malison (Type 3)",
      "Yuan-ti Pureblood",
      "Zombie",
    ]
    return veryStupidHardcodeTextfiles;
    const response = await fetch('link-files/');
    const txtFile = await response.text();
    const txtFiles = txtFile.split('\n').flatMap(line => line.split(' ')).filter(word => word.trim().endsWith('.txt'));
    return txtFiles;
  }
          