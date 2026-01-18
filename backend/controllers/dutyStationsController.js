// Example: dutyStationsController.js
exports.getAllStations = async (req, res) => {
    const stations = await DutyStation.findAll();
    res.json(stations);
};

exports.createStation = async (req, res) => {
    const newStation = await DutyStation.create(req.body);
    res.json(newStation);
};

// Similarly, create routes/controllers for projects, education_levels, software_skills, languages
