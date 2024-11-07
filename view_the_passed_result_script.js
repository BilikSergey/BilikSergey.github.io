let db;
let questionCount = 0;
const testInfo = getTestData();
let user_id;
let test_id;
let questionsData;
let submission_id;

async function executeFunctions() {
    await initDatabase();
    user_id = db.exec(`SELECT id FROM users WHERE username = '${testInfo.teacher_name}'`);
    test_id = db.exec(`SELECT id FROM tests WHERE user_id = '${user_id[0].values[0][0]}' AND title = '${testInfo.test_name}'`)[0].values[0][0];
    questionsData = db.exec(`SELECT * FROM questions WHERE test_id = ${test_id}`);
    submission_id = db.exec(`SELECT id FROM submissions WHERE test_id = ${test_id} AND student_id = ${getUserData().id}`)[0].values[0][0];
    generateTest();
}
executeFunctions();

async function generateTest(){
    for(let i = 0; i<questionsData[0].values.length; i++){
        const optionData = db.exec(`SELECT * FROM options WHERE question_id = ${questionsData[0].values[i][0]}`);
        const container = document.getElementById('questionsContainer');
        questionCount++;
        const questionForm = document.createElement('div');
        questionForm.classList.add('question-form');
        questionForm.dataset.questionId = questionCount;

        const questionLabel = document.createElement('label');
        questionLabel.textContent = 'Questions:';
        questionForm.appendChild(questionLabel);

        const questionInput = document.createElement('input');
        questionInput.type = 'text';
        questionInput.readOnly = true;  
        questionInput.placeholder = 'The content of the question'
        questionInput.id = `question${questionCount}`;
        questionInput.name = `question${questionCount}`;
        questionInput.value = questionsData[0].values[i][2];
        questionForm.appendChild(questionInput);
        const checkedOption = db.exec("SELECT selected_option_id FROM option_responses WHERE test_id = ? AND question_id = ?", [test_id, questionsData[0].values[i][0]]);
        switch(questionsData[0].values[i][3]){
            case ("true/false"):
                if(optionData[0].values[0][0]===checkedOption[0].values[0][0]){
                    const trueFalseOptionsTrue = document.createElement('div');
                    trueFalseOptionsTrue.classList.add('true-false-options');
                    trueFalseOptionsTrue.innerHTML = `
                        <label><input id="id_true${questionCount}" checked type="radio" name="answer${questionCount}" value="true">True</label>
                        <label><input id="id_false${questionCount}" type="radio" name="answer${questionCount}" value="false">False</label>
                    `;
                    questionForm.appendChild(trueFalseOptionsTrue);
                } else{
                    const trueFalseOptionsFalse = document.createElement('div');
                    trueFalseOptionsFalse.classList.add('true-false-options');
                    trueFalseOptionsFalse.innerHTML = `
                        <label><input id="id_true${questionCount}" type="radio" name="answer${questionCount}" value="true">True</label>
                        <label><input id="id_false${questionCount}" checked type="radio" name="answer${questionCount}" value="false">False</label>
                    `;
                    questionForm.appendChild(trueFalseOptionsFalse);
                }
                break;
            case ("multiple"):
                const multipleChoiceOptions = document.createElement('div');
                multipleChoiceOptions.classList.add('options-container', 'multiple-choice-options');
                multipleChoiceOptions.id = `id-div-multiple-choice-options${questionCount}`;
                multipleChoiceOptions.style.display = 'block';
                const id_checkBox_Fectch = questionCount;
                for(let j = 0; j <optionData[0].values.length; j++){
                    addCheckboxOption(id_checkBox_Fectch, multipleChoiceOptions, optionData[0].values[j][3], j, optionData);
                    questionForm.appendChild(multipleChoiceOptions);
                }
                break;
        }
        const scoreContainer = document.createElement('div');
        scoreContainer.classList.add('score-container');

        const scoreLabel = document.createElement('label');
        scoreLabel.textContent = 'Score';
        scoreContainer.appendChild(scoreLabel);

        const scoreInput = document.createElement('label');
        scoreInput.id = `score${questionCount}`;
        scoreInput.name = `score${questionCount}`;
        scoreInput.textContent = questionsData[0].values[i][4];
        scoreContainer.appendChild(scoreInput);
        questionForm.appendChild(scoreContainer);
        container.appendChild(questionForm);
    }
}

function addCheckboxOption(id_checkBox_Fectch, container, optionDataText, j, optionData) { 
    const question_id = id_checkBox_Fectch-1;
    const checkedOption = db.exec("SELECT selected_option_id FROM option_responses WHERE submission_id = ? AND test_id = ? AND question_id = ?", [submission_id, test_id, questionsData[0].values[question_id][0]]);
    console.log(checkedOption);
    const optionDiv = document.createElement('div');
    optionDiv.classList.add('multiple-choice-option');
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    for(let i = 0; i<checkedOption[0].values.length;i++){
        if(optionData[0].values[j][0]===checkedOption[0].values[i][0]){
            checkbox.checked = true;
        }
    }
    j++;
    checkbox.id = `multipleChoice${id_checkBox_Fectch}${j}[]`;
    
    const optionInput = document.createElement('input');
    optionInput.type = 'text';
    optionInput.readOnly = true;
    optionInput.id = `multipleChoiceText${id_checkBox_Fectch}${j}[]`;
    optionInput.placeholder = 'Answer option';
    optionInput.value = optionDataText;    

    optionDiv.appendChild(checkbox);
    optionDiv.appendChild(optionInput);
    container.appendChild(optionDiv, container.lastElementChild);       
}

function getTestData(){
    return {
        teacher_name: localStorage.getItem("teacher_name"),
        test_name: localStorage.getItem("test_name"),
        score: localStorage.getItem("score"),
        date: localStorage.getItem("date")
    }
}

function clearTestData() {
    localStorage.removeItem("teacher_name");
    localStorage.removeItem("test_name");
    localStorage.removeItem("score");
    localStorage.removeItem("date");
}