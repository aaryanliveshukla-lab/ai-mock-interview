const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://admin:15LKWkyxBnGSjcLt@completebackend.lqoulh3.mongodb.net/';

async function fixHistory() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('ai_mock_interview');
    
    // Find sessions that have overallScore 0 (from feedback)
    const feedbackCol = db.collection('interview_feedback');
    const zeroFeedback = await feedbackCol.find({ overallScore: 0 }).toArray();
    
    if (zeroFeedback.length > 0) {
      const sessionIds = zeroFeedback.map(f => f.sessionId);
      
      console.log(`Deleting ${sessionIds.length} broken interview sessions...`);
      
      await db.collection('interview_sessions').deleteMany({ _id: { $in: sessionIds } });
      await db.collection('interview_questions').deleteMany({ sessionId: { $in: sessionIds } });
      await db.collection('interview_answers').deleteMany({ sessionId: { $in: sessionIds } });
      await feedbackCol.deleteMany({ sessionId: { $in: sessionIds } });
      
      console.log('Successfully cleaned up history.');
    } else {
      console.log('No broken 0-score interviews found to clean.');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

fixHistory();
