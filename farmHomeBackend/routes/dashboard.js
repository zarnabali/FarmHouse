const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Animal = require('../models/Animal');
const Breeding = require('../models/Breeding');
const Incident = require('../models/Incident');
const User = require('../models/User');

// Helper: Age group calculation
function getAgeGroup(dob) {
  const now = new Date();
  const ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  if (ageMonths < 6) return '0-6 months';
  if (ageMonths < 12) return '6-12 months';
  if (ageMonths < 24) return '1-2 years';
  if (ageMonths < 48) return '2-4 years';
  return '4+ years';
}

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get real-time dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       value:
 *                         type: string
 *                 ageDistribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ageGroup:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 sexDistribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sex:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 breedDistribution:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       breed:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 breeding:
 *                   type: object
 *                   properties:
 *                     successful:
 *                       type: integer
 *                     failed:
 *                       type: integer
 *                     inProgress:
 *                       type: integer
 *                     successRate:
 *                       type: integer
 *                 suggestions:
 *                   type: object
 *                   properties:
 *                     culling:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tagId:
 *                             type: string
 *                           reason:
 *                             type: string
 *                     breeding:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tagId:
 *                             type: string
 *                           reason:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Animal stats
    const animals = await Animal.find();
    const totalAnimals = animals.length;
    const ageGroups = { '0-6 months': 0, '6-12 months': 0, '1-2 years': 0, '2-4 years': 0, '4+ years': 0 };
    const sexGroups = { Male: 0, Female: 0 };
    const breedGroups = {};
    animals.forEach(animal => {
      // Age group
      const group = getAgeGroup(animal.dob);
      ageGroups[group] = (ageGroups[group] || 0) + 1;
      // Sex
      sexGroups[animal.gender] = (sexGroups[animal.gender] || 0) + 1;
      // Breed
      breedGroups[animal.breed] = (breedGroups[animal.breed] || 0) + 1;
    });

    // Breeding stats
    const breedings = await Breeding.find();
    let successful = 0, failed = 0, inProgress = 0;
    breedings.forEach(b => {
      if (b.status && b.status.toLowerCase() === 'successful') successful++;
      else if (b.status && b.status.toLowerCase() === 'failed') failed++;
      else inProgress++;
    });
    const breedingSuccessRate = breedings.length ? Math.round((successful / breedings.length) * 100) : 0;

    // Health incidents (recent month)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const healthIncidents = await Incident.countDocuments({ incidentDate: { $gte: oneMonthAgo } });

    // Active users (not blocked)
    const activeUsers = await User.countDocuments({ blocked: false });

    // Suggested animals for culling (dummy logic: age > 6 years or condition = 'poor')
    const cullSuggestions = animals.filter(a => {
      const ageYears = (new Date().getFullYear() - a.dob.getFullYear());
      return ageYears >= 6 || (a.condition && a.condition.toLowerCase() === 'poor');
    }).map(a => ({ tagId: a.tagId, reason: a.condition && a.condition.toLowerCase() === 'poor' ? 'Poor condition' : 'Age 6+ years' }));

    // Suggested animals for breeding (dummy logic: age 1-4 years, condition = 'good', female)
    const breedSuggestions = animals.filter(a => {
      const ageYears = (new Date().getFullYear() - a.dob.getFullYear());
      return ageYears >= 1 && ageYears <= 4 && a.condition && a.condition.toLowerCase() === 'good' && a.gender === 'Female';
    }).map(a => ({ tagId: a.tagId, reason: 'Optimal age, good condition' }));

    res.json({
      stats: [
        {
          title: 'Total Animals',
          value: totalAnimals,
        },
        {
          title: 'Breeding Success Rate',
          value: `${breedingSuccessRate}%`,
        },
        {
          title: 'Health Incidents (last month)',
          value: healthIncidents,
        },
        {
          title: 'Active Users',
          value: activeUsers,
        },
      ],
      ageDistribution: Object.entries(ageGroups).map(([ageGroup, count]) => ({ ageGroup, count })),
      sexDistribution: Object.entries(sexGroups).map(([sex, count]) => ({ sex, count })),
      breedDistribution: Object.entries(breedGroups).map(([breed, count]) => ({ breed, count })),
      breeding: {
        successful,
        failed,
        inProgress,
        successRate: breedingSuccessRate,
      },
      suggestions: {
        culling: cullSuggestions,
        breeding: breedSuggestions,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 