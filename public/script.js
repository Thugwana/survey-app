
document.getElementById('surveyForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const date = form.date.value;
    const contact = form.contacts.value;
    const age = calculateAge(date);

    const favouriteFood = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    const ratings = ["eat_out", "watch_movies", "watch_tv", "listen_to_radio"].map(field => parseInt(form[field].value));
  
    if (!name || !email || !age || !date || !contact || favouriteFood.length === 0 || ratings.includes(NaN)) {
      alert('Please complete all required fields.');
      return;
    }
     if (age < 5 || age > 120) {
    alert('Age must be between 5 and 120 years.');
    return;
  }
  
    const response = await fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, age, date, contact, favouriteFood, ratings  })
    });
  
    if (response.ok) {
      alert('Survey submitted successfully!');
      form.reset();
    } else {
      alert('Submission failed.');
    }
  });
    // ✅ Calculate age from birthdate
  function calculateAge(birthdate) {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  