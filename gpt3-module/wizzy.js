const openai_token = process.env.OPEN_AI_TOKEN;


const stringSimilarity = require('string-similarity');
const fetch = require('node-fetch');
//const prompt = require("prompt-sync")({ sigint: true });


const base_prompt = function(topic) {
    return `Below is a long paragraph generated by Wizzy AI (An artificial intelligence philosopher), which sees the human world from the outside, without the prejudices of human experience. Fully neutral and objective, the AI sees the world as is. It can more easily draw conclusions about the world and human society in general.

            The topic provided by the human is '${topic}', to which the AI responds with deep thought.

            Wizzy AI: "Hmmm, interesting topic. Here is my rather lengthy response:"`;
}

async function completion_query(prompt, options) {
    if(!options) options = {};

    let url = "https://api.openai.com/v1/engines/davinci/completions"
    let headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openai_token}`,
    }
    let body = {
        prompt,
        "max_tokens": options.max_tokens || 250,
        "temperature": options.temperature || 0.9,
        "presence_penalty": options.presence_penalty,
        "frequency_penalty": options.frequency_penalty,
        "n": options.n || 1,
        "stream": false,
        "logprobs": null,
        "stop": options.stop,
    }

    console.log(body);

    const responseRaw = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    const response = await responseRaw.json();

    return {response, prompt};
}

async function get_prompt_for_ongoing_query({topic, prev_completions}) {

    let prompt = base_prompt(topic);

    if(prev_completions.length > 0) {
        // Append "Philosopher AI: " to give it a chat structure
        prompt += prev_completions.map(s => `Wizzy AI: "${s}"`).join("\n\n");
    }

     prompt += `\n\nWizzy AI: "`;
    
    return prompt;
}


async function get_gpt3_response({prompt, opts}) {
    if(!opts) {
        opts = {temperature: 0.7, presence_penalty: 1.0, frequency_penalty: 1.0, max_tokens: 500, stop: ["Wizzy AI:", "\"\n", "\n\n\n", "\n\""]};
    }

    let completion = await completion_query(prompt, opts);

    if(completion.response.choices) {
        let choice = completion.response.choices[0];
        let response = choice.text;
        response = response.trim();

        if(response[response.length-1] == `"` || response[response.length-1] == `〞`) {
            response = response.slice(0, -1); 
        }

        return response;
    } else {
        console.log('completion:', completion.response);
        return null;
    }
}

async function get_philosopher_response({topic}) {
    console.log(`Asking Wizzy AI: "${topic}" ...\n\n`)
    const continuations = 6;

    let past_responses = [];
    let answer = '';
    for(let j=0; j<continuations; j++) {
        let prompt = await get_prompt_for_ongoing_query({topic, prev_completions: past_responses});
        let response = await get_gpt3_response({prompt});
        if(!response) {
            break;
        }

        for(let prev_response of past_responses) {
            if(stringSimilarity.compareTwoStrings(response, prev_response) > 0.95) {
                // stop repeating yourself
                return answer;
            }
        }

        if(response != "") {
            console.log(`reponse ${j}`, response + "\n")
            answer += response;
            past_responses.push(response)
        }
    }

    return answer;
}

async function ask(Q) {
    const answer = await get_philosopher_response({topic: Q});
    return answer;
}

/*(async function() {
    // await get_philosopher_response({topic: "what is the best wisdom to survive a bear market?"});
    const Q = await prompt(" I don't know you you heard something about me, what is your question: ");
    await get_philosopher_response({topic: Q});
})()*/

module.exports = {
    ask
}