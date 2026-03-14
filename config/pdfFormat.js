const modules = require('./modules');

/**
 * Aggregates all faculty performance data and defines the PDF layout.
 * This supports Objective 7: Instant Report Generation[cite: 132].
 */
module.exports = {
    // 1. DATA AGGREGATOR: Fetches all 37 modules from MongoDB [cite: 164, 165]
    getFacultyData: async function(userId, academicYear) {
        try {
            const data = await Promise.all([
                modules.TeachingLoad.find({ user: userId, academic_year: academicYear }),
                modules.TeachingAssistant.find({ user: userId }),
                modules.NewBooks.find({ user: userId }),
                modules.AddedExp.find({ user: userId }),
                modules.Innovation.find({ user: userId }),
                modules.Leave.find({ user: userId }),
                modules.TimeTable.find({ user: userId }),
                modules.ClassAdvisor.find({ user: userId }),
                modules.SportsActivities.find({ user: userId }),
                modules.CulturalActivities.find({ user: userId }),
                modules.ProjectBasedLearning.find({ user: userId }),
                modules.Udaan.find({ user: userId }),
                modules.PlacementActivities.find({ user: userId }),
                modules.InhousePlacement.find({ user: userId }),
                modules.StudentOrganizations.find({ user: userId }),
                modules.IndustrialVisitActivities.find({ user: userId }),
                modules.AdmissionProcessActivities.find({ user: userId }),
                modules.ExamAssessmentExternal.find({ user: userId }),
                modules.ExamActivitiesSupervision.find({ user: userId }),
                modules.ExamActivitiesCollegeLevel.find({ user: userId }),
                modules.ITMaintenance.find({ user: userId }),
                modules.Lakshya.find({ user: userId }),
                modules.MagazineNewsletter.find({ user: userId }),
                modules.STTP.find({ user: userId }),
                modules.DepartmentUGProjects.find({ user: userId }),
                modules.PapersPublishedNationalConf.find({ user: userId }),
                modules.PapersPublishedInternationalConf.find({ user: userId }),
                modules.PapersPublishedJournals.find({ user: userId }),
                modules.Moocs.find({ user: userId }),
                modules.Swayam.find({ user: userId }),
                modules.ShortTermTraining.find({ user: userId }),
                modules.Seminars.find({ user: userId }),
                modules.ResourcePerson.find({ user: userId }),
                modules.ContributionToSyllabus.find({ user: userId }),
                modules.MemberOfUniversityCommitte.find({ user: userId }),
                modules.ConsultancyAssignment.find({ user: userId }),
                modules.ExternalProjectsOrCompetition.find({ user: userId })
            ]);
            return data;
        } catch (err) {
            console.error("PDF Data Fetch Error:", err);
            throw err;
        }
    },

    // 2. PDF GENERATOR: Defines the visual layout and tables [cite: 167, 432]
    generatePdfDefinition: function(data, userDetails, appraisalInfo) {
        return {
            content: [
                { text: 'WALCHAND INSTITUTE OF TECHNOLOGY, SOLAPUR', style: 'header' },
                { text: '(An Autonomous Institute)', alignment: 'center', fontSize: 10 },
                { text: 'Faculty Performance Appraisal Report', style: 'subheader' },
                { text: `Academic Year: ${appraisalInfo.academic_year}`, alignment: 'center', margin: [0, 0, 0, 20] },

                {
                    columns: [
                        { text: `Name: ${userDetails.name}`, bold: true },
                        { text: `Department: ${userDetails.department}`, bold: true, alignment: 'right' }
                    ]
                },
                { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1 }] },

                // PART 1: Teaching Table [cite: 382, 383]
                { text: '1. Teaching and Learning Activities', style: 'sectionHeader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            [{ text: 'Course', style: 'tableHeader' }, { text: 'Sem', style: 'tableHeader' }, { text: 'Scheduled', style: 'tableHeader' }, { text: 'Held', style: 'tableHeader' }],
                            ...data[0].map(item => [item.courseName, item.semester, item.scheduledClasses, item.heldClasses])
                        ]
                    }
                },

                // PART 2: Research Table [cite: 376, 377]
                { text: '2. Research and Publications', style: 'sectionHeader' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto'],
                        body: [
                            [{ text: 'Title', style: 'tableHeader' }, { text: 'Journal/Conference', style: 'tableHeader' }, { text: 'Authors', style: 'tableHeader' }],
                            ...data[27].map(pub => [pub.title, pub.journalOrBook || 'Journal', pub.authors])
                        ]
                    }
                },

                // Approval Section 
                { text: '\n\n\nApproval Signatures', margin: [0, 30, 0, 10], bold: true },
                {
                    columns: [
                        { text: '__________________\nFaculty Signature', alignment: 'left' },
                        { text: '__________________\nHOD Signature', alignment: 'center' },
                        { text: '__________________\nPrincipal Signature', alignment: 'right' }
                    ]
                }
            ],
            styles: {
                header: { fontSize: 16, bold: true, alignment: 'center' },
                subheader: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 5, 0, 5] },
                sectionHeader: { fontSize: 12, bold: true, margin: [0, 15, 0, 5], color: '#003366' },
                tableHeader: { bold: true, fontSize: 10, fillColor: '#f2f2f2' }
            }
        };
    }
};