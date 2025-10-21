import axios from 'axios';

const run = async () => {
  try {
    const resp = await axios.post('http://127.0.0.1:8000/api/v1/generate-test-cases', {
      user_story: 'US1\n\nAls Benutzer möchte ich mich anmelden, damit ich mein Dashboard sehen kann.',
      num_test_cases: 3
    }, { timeout: 5000 });
    console.log('STATUS', resp.status);
    console.log('DATA', JSON.stringify(resp.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.log('ERROR STATUS', err.response.status);
      console.log('ERROR DATA', err.response.data);
    } else {
      console.log('ERROR', err.message);
    }
  }
};

run();
