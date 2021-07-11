const addArea = document.getElementById("add-area");
const activeArea = document.getElementById("active-area");
const foreverArea = document.getElementById("forever-area");
const temporaryBtn = document.getElementById("temporary-btn");
const foreverBtn = document.getElementById("forever-btn");
const updateBtn = document.getElementById("update-btn");
const lockBtn = document.getElementById("lock-btn");
const deadlineOutput = document.getElementById("display-deadline");
const dateDeadline = document.getElementById("date-deadline-input");
const timeDeadline = document.getElementById("time-deadline-input");

// On options page load
window.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["blocked", "forever", "deadline", "locked"], function (local) {
    const { blocked, forever, deadline, locked} = local;
	console.log(local);
	const format = new Date(deadline);
	
	dateDeadline.value = getDate(format);
	timeDeadline.value = getTime(format);
	if (Array.isArray(blocked)) {
		activeArea.value = blocked.join("\n");
	}
	if (Array.isArray(forever)) {
      foreverArea.value = forever.join("\n");
	}
	if (!locked || deadline - Date.now() <= 0)
	{
		chrome.storage.local.set({ locked: false });
		hideElements(false);
	}
	else
	{
		displayDeadline(format);
	}
  });
});

//  add domain to temporary block list 
temporaryBtn.addEventListener("click", () => {
	let content = addArea.value.trim();
	if(content != "")
	{
		chrome.storage.local.get(["blocked"], function (local) {
			addArea.value = "";
			if (Array.isArray(local.blocked))
			{
				local.blocked.forEach(el => {
					content += "\n" + el;
				});
			}
			activeArea.value = content.trim();
			const blocked = content.split("\n").map(s => s.trim()).filter(Boolean);
			chrome.storage.local.set({ blocked });
		});
	}
});

// add domain to forever block list
foreverBtn.addEventListener("click", () => {
	let content = addArea.value.trim();
	if(content != "")
	{
		if (window.confirm('This action will block the following domains forever: \n\n'+content+'\n\nThere\'s no way back.\nContinue anyway ?'))
		{
			chrome.storage.local.get(["forever"], function (local) {
				addArea.value = "";
				if (Array.isArray(local.forever))
				{
					local.forever.forEach(el => {
						content += "\n" + el;
					});
				}
				foreverArea.value = content.trim();
				const forever = content.split("\n").map(s => s.trim()).filter(Boolean);
				chrome.storage.local.set({ forever });
			});
		}
	}
});

// on change to deadline's day
dateDeadline.addEventListener("change",()=>{
	chrome.storage.local.set({ deadline: createDeadline()});
});

// on change to deadline's time
timeDeadline.addEventListener("change",()=>{
	chrome.storage.local.set({ deadline: createDeadline() });
});

// update temporary blocking list
updateBtn.addEventListener("click", () => {
  const blocked = activeArea.value.split("\n").map(s => s.trim()).filter(Boolean);
  chrome.storage.local.set({ blocked });
});

// lock the temporary list until the selected deadline date&time
lockBtn.addEventListener("click", () => {
	chrome.storage.local.get(["deadline"], function (local) {
		const now = Date.now();
		if (local.deadline - now > 0)
		{
			chrome.storage.local.set({ locked: true });
			hideElements(true);
			displayDeadline(new Date(local.deadline));
		}
	});
});

// returns the proper date+time timestamp
function createDeadline()
{
	const d = dateDeadline.value.split('-');
	const t = timeDeadline.value.split(':');
	let deadline = new Date(d[0], d[1] - 1, d[2], t[0], t[1]);
	return Date.parse(deadline);
}

// returns HH:mm from deadline
function getTime(format)
{
	const timezone = format.getTimezoneOffset();
	const hours = parseInt(format.getUTCHours()) - (parseInt(timezone) / 60);
	let minutes = format.getUTCMinutes();
	if (minutes < 10)
	{
		minutes = "0" + minutes;
	}
	return (hours + ":" + minutes);
}

// returns YYYY-mm-dd from deadline
function getDate(format)
{
	return format.toISOString().split('T')[0];
}

// toggle .hidden DOM elements
function hideElements(toggle)
{
	const display = (toggle) ? "none" : "block";
	const hidden = document.querySelectorAll(".hidden");
	hidden.forEach(el => {
		el.style.display = display;
	})	
}

function displayDeadline(format)
{
	const content = document.createTextNode(`Locked until: ${getDate(format)} ${getTime(format)}.`);
	deadlineOutput.appendChild(content);
}