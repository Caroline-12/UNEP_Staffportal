// staffController.js
exports.searchStaff = async (req, res) => {
    const { fullnames, duty_station_id, education_level_id } = req.query;
    const staff = await Staff.findAll({
        where: {
            ...(fullnames && { fullnames: { [Op.like]: `%${fullnames}%` } }),
            ...(duty_station_id && { duty_station_id }),
            ...(education_level_id && { education_level_id })
        },
        include: [EducationLevel, DutyStation, Project, SoftwareSkill, Language]
    });
    res.json(staff);
};
