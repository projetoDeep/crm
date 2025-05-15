chrome.alarms.onAlarm.addListener((alarm) => {
    console.log("Alarme disparado:", alarm);
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon.png",
      title: "Lembrete WA",
      message: `Hora de recontatar: ${alarm.name}`,
      priority: 2
    });
  });