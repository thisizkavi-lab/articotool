export type PhrasePriority = 'core' | 'useful'

export interface EverydayPhrase {
  id: string
  target: string
  function: string
  priority: PhrasePriority
  variants: string[]
  note?: string
}

export interface EverydayChapter {
  id: string
  number: number
  title: string
  description: string
  phrases: EverydayPhrase[]
}

const phrase = (
  id: string,
  target: string,
  func: string,
  priority: PhrasePriority,
  variants: string[] = [],
  note?: string,
): EverydayPhrase => ({ id, target, function: func, priority, variants, note })

export const EVERYDAY_ENGLISH_ACCENT = {
  label: 'Contemporary NYC / Northeast General American',
  description:
    'Native conversational American English with a New York / Northeast preference, while avoiding exaggerated regional features. The target is modern, natural, broadly understandable American speech.',
}

export const EVERYDAY_ENGLISH_CHAPTERS: EverydayChapter[] = [
  {
    id: '01-greetings',
    number: 1,
    title: 'Greetings',
    description: 'Open a conversation naturally and handle common greeting exchanges.',
    phrases: [
      phrase('greet-01', 'Hey.', 'casual greeting', 'core', ['hey', 'hey there']),
      phrase('greet-02', 'Hi.', 'neutral greeting', 'core', ['hi', 'hi there']),
      phrase('greet-03', "How's it going?", 'ask how someone is doing', 'core', ["how's it going", 'how are you doing']),
      phrase('greet-04', "How've you been?", 'reconnect after some time', 'core', ["how've you been", 'how have you been']),
      phrase('greet-05', 'Good to see you.', 'warm greeting', 'core', ['good to see you', 'great to see you']),
      phrase('greet-06', 'Long time no see.', 'reconnect after a long gap', 'useful', ['long time no see']),
      phrase('greet-07', 'Nice to meet you.', 'first meeting', 'core', ['nice to meet you', 'great to meet you']),
      phrase('greet-08', 'Good morning.', 'time-specific greeting', 'useful', ['good morning', 'morning']),
    ],
  },
  {
    id: '02-introductions',
    number: 2,
    title: 'Making introductions',
    description: 'Introduce yourself and connect other people without sounding stiff.',
    phrases: [
      phrase('intro-01', "I'm ___.", 'introduce yourself', 'core', ["i'm", 'i am']),
      phrase('intro-02', "My name's ___.", 'introduce yourself', 'core', ["my name's", 'my name is']),
      phrase('intro-03', "I don't think we've met.", 'open an introduction', 'core', ["i don't think we've met", "i don't think we met"]),
      phrase('intro-04', "I'm a friend of ___'s.", 'explain connection', 'useful', ["i'm a friend of", 'a friend of']),
      phrase('intro-05', 'You can call me ___.', 'give preferred name', 'core', ['you can call me', 'just call me']),
      phrase('intro-06', 'Have you met ___?', 'introduce two people', 'core', ['have you met', 'do you know']),
      phrase('intro-07', "I'd like you to meet ___.", 'make an introduction', 'useful', ["i'd like you to meet", 'i want you to meet']),
      phrase('intro-08', 'Great to meet you.', 'respond to an introduction', 'core', ['great to meet you', 'nice to meet you']),
    ],
  },
  {
    id: '03-conversation-fillers',
    number: 3,
    title: 'Conversation fillers',
    description: 'Use natural discourse markers, hesitation devices, and listening signals.',
    phrases: [
      phrase('fill-01', 'So, ...', 'start or shift a thought', 'core', ['so']),
      phrase('fill-02', 'Well, ...', 'soften or frame a response', 'core', ['well']),
      phrase('fill-03', 'I mean, ...', 'clarify or reformulate', 'core', ['i mean']),
      phrase('fill-04', 'You know, ...', 'manage flow or invite shared understanding', 'core', ['you know']),
      phrase('fill-05', 'Actually, ...', 'correct or add contrast', 'core', ['actually']),
      phrase('fill-06', 'I guess.', 'soften certainty', 'core', ['i guess', 'i suppose']),
      phrase('fill-07', 'To be honest, ...', 'signal candid opinion', 'core', ['to be honest', 'honestly']),
      phrase('fill-08', 'Right.', 'acknowledge and continue', 'useful', ['right', 'yeah right']),
      phrase('fill-09', 'Uh-huh.', 'show active listening', 'useful', ['uh-huh', 'mhm']),
      phrase('fill-10', 'Really?', 'show interest or surprise', 'core', ['really']),
    ],
  },
  {
    id: '04-not-understanding',
    number: 4,
    title: "Saying you don't understand",
    description: 'Repair a conversation smoothly when you miss meaning or audio.',
    phrases: [
      phrase('understand-01', 'Sorry?', 'ask for repetition', 'core', ['sorry', 'sorry?']),
      phrase('understand-02', 'What was that?', 'ask what someone said', 'core', ['what was that', 'what did you say']),
      phrase('understand-03', "I didn't catch that.", 'say you did not hear clearly', 'core', ["i didn't catch that", "didn't catch that"]),
      phrase('understand-04', "I'm not sure what you mean.", 'say meaning is unclear', 'core', ["i'm not sure what you mean", 'not sure what you mean']),
      phrase('understand-05', 'What do you mean?', 'ask for clarification', 'core', ['what do you mean', 'what do you mean by that']),
      phrase('understand-06', 'Could you say that again?', 'request repetition politely', 'core', ['could you say that again', 'can you say that again']),
      phrase('understand-07', 'Can you slow down a little?', 'request slower speech', 'useful', ['can you slow down', 'could you speak more slowly']),
      phrase('understand-08', 'Could you walk me through that again?', 'ask for another explanation', 'useful', ['walk me through that', 'explain that again']),
    ],
  },
  {
    id: '05-opinions-preferences',
    number: 5,
    title: 'Opinions and preferences',
    description: 'Say what you like, dislike, prefer, or think in natural American English.',
    phrases: [
      phrase('opinion-01', 'What do you think?', 'ask for an opinion', 'core', ['what do you think', 'what do you think about']),
      phrase('opinion-02', 'How do you feel about it?', 'ask for a view', 'core', ['how do you feel about it', 'how do you feel about']),
      phrase('opinion-03', "I'm really into it.", 'say you like something', 'core', ["i'm really into", 'really into it']),
      phrase('opinion-04', "I'm not really into it.", 'say you do not like something', 'core', ["i'm not really into", 'not really into it']),
      phrase('opinion-05', "It's not really my thing.", 'softly say you dislike something', 'core', ["it's not really my thing", 'not my thing']),
      phrase('opinion-06', "I can't stand it.", 'strong dislike', 'useful', ["i can't stand", 'cannot stand']),
      phrase('opinion-07', "I'd say ...", 'give an opinion naturally', 'core', ["i'd say", 'i would say']),
      phrase('opinion-08', "I'd rather ...", 'state a preference', 'core', ["i'd rather", 'i would rather']),
      phrase('opinion-09', "I don't really mind.", 'express indifference', 'core', ["i don't really mind", "i don't mind"]),
      phrase('opinion-10', 'Either way works for me.', 'express flexibility', 'core', ['either way works for me', 'either one works for me']),
    ],
  },
  {
    id: '06-agreeing-disagreeing',
    number: 6,
    title: 'Agreeing and disagreeing',
    description: 'Agree clearly, disagree without sounding harsh, and close a disagreement.',
    phrases: [
      phrase('agree-01', 'Exactly.', 'strong agreement', 'core', ['exactly']),
      phrase('agree-02', 'Absolutely.', 'strong agreement', 'core', ['absolutely']),
      phrase('agree-03', "That's a good point.", 'acknowledge a point', 'core', ["that's a good point", 'good point']),
      phrase('agree-04', 'I totally agree.', 'explicit agreement', 'core', ['i totally agree', 'i completely agree']),
      phrase('agree-05', 'I know what you mean.', 'show shared understanding', 'core', ['i know what you mean']),
      phrase('agree-06', 'Yeah, I hear you.', 'acknowledge another perspective', 'core', ['i hear you', 'yeah i hear you']),
      phrase('agree-07', "I'm not sure I agree.", 'soft disagreement', 'core', ["i'm not sure i agree", "i don't know if i agree"]),
      phrase('agree-08', "I'm not convinced.", 'express doubt', 'useful', ["i'm not convinced", 'not convinced']),
      phrase('agree-09', 'We may have to agree to disagree.', 'end disagreement politely', 'useful', ['agree to disagree']),
      phrase('agree-10', "Let's just move on.", 'close the topic', 'core', ["let's just move on", 'we can move on']),
    ],
  },
  {
    id: '07-making-suggestions',
    number: 7,
    title: 'Making suggestions',
    description: 'Suggest plans, accept them, and turn them down naturally.',
    phrases: [
      phrase('suggest-01', 'How about ...?', 'make a suggestion', 'core', ['how about']),
      phrase('suggest-02', "Why don't we ...?", 'make a suggestion', 'core', ["why don't we", 'why dont we']),
      phrase('suggest-03', 'We could ...', 'offer an option', 'core', ['we could']),
      phrase('suggest-04', "Let's ...", 'make a direct plan', 'core', ["let's", 'let us']),
      phrase('suggest-05', 'Are you up for ...?', 'ask if someone wants to join', 'core', ['are you up for', 'you up for']),
      phrase('suggest-06', "I'm in.", 'accept enthusiastically', 'core', ["i'm in", 'count me in']),
      phrase('suggest-07', 'Sounds good.', 'accept a suggestion', 'core', ['sounds good', 'that sounds good']),
      phrase('suggest-08', "I'd rather not.", 'decline softly', 'core', ["i'd rather not", 'rather not']),
      phrase('suggest-09', "I don't really feel like it.", 'decline based on mood', 'core', ["i don't really feel like it", "don't feel like it"]),
    ],
  },
  {
    id: '08-thank-you',
    number: 8,
    title: 'Saying thank you',
    description: 'Thank people naturally and respond without sounding overly formal.',
    phrases: [
      phrase('thanks-01', 'Thanks.', 'casual thanks', 'core', ['thanks', 'thank you']),
      phrase('thanks-02', 'Thanks a lot.', 'stronger thanks', 'core', ['thanks a lot']),
      phrase('thanks-03', 'Thank you so much.', 'warm thanks', 'core', ['thank you so much', 'thanks so much']),
      phrase('thanks-04', 'I really appreciate it.', 'express sincere appreciation', 'core', ['i really appreciate it', 'really appreciate it']),
      phrase('thanks-05', "I can't thank you enough.", 'very strong gratitude', 'useful', ["i can't thank you enough"]),
      phrase('thanks-06', "That's so kind.", 'respond to kindness', 'useful', ["that's so kind", 'so kind of you']),
      phrase('thanks-07', 'I owe you one.', 'thank someone for a favor', 'useful', ['i owe you one']),
      phrase('thanks-08', "You're welcome.", 'respond to thanks', 'core', ["you're welcome", 'you are welcome']),
      phrase('thanks-09', 'No problem.', 'casual response to thanks', 'core', ['no problem', 'no worries']),
      phrase('thanks-10', 'Anytime.', 'friendly response to thanks', 'core', ['anytime', 'any time']),
    ],
  },
  {
    id: '09-saying-sorry',
    number: 9,
    title: 'Saying sorry',
    description: 'Apologize, accept apologies, and express sympathy.',
    phrases: [
      phrase('sorry-01', 'Sorry.', 'simple apology', 'core', ['sorry', "i'm sorry"]),
      phrase('sorry-02', 'My bad.', 'casual apology', 'core', ['my bad']),
      phrase('sorry-03', "I'm really sorry.", 'strong apology', 'core', ["i'm really sorry", 'really sorry']),
      phrase('sorry-04', 'I owe you an apology.', 'formal sincere apology', 'useful', ['i owe you an apology']),
      phrase('sorry-05', 'No worries.', 'accept an apology casually', 'core', ['no worries', 'no problem']),
      phrase('sorry-06', 'No big deal.', 'minimize a mistake', 'core', ['no big deal', "it's no big deal"]),
      phrase('sorry-07', "That's okay.", 'accept an apology', 'core', ["that's okay", "it's okay"]),
      phrase('sorry-08', "I'm sorry to hear that.", 'express sympathy', 'core', ["i'm sorry to hear that", 'sorry to hear that']),
      phrase('sorry-09', "I'm sorry for your loss.", 'express condolence', 'useful', ["i'm sorry for your loss", 'sorry for your loss']),
    ],
  },
  {
    id: '10-saying-goodbye',
    number: 10,
    title: 'Saying goodbye',
    description: 'End casual and professional conversations naturally.',
    phrases: [
      phrase('bye-01', 'Bye.', 'simple goodbye', 'core', ['bye']),
      phrase('bye-02', 'See you.', 'casual goodbye', 'core', ['see you', 'see ya']),
      phrase('bye-03', 'Talk to you soon.', 'friendly future contact', 'core', ['talk to you soon', 'talk soon']),
      phrase('bye-04', 'Good talking with you.', 'close a conversation warmly', 'core', ['good talking with you', 'great talking with you']),
      phrase('bye-05', 'It was nice meeting you.', 'end a first meeting', 'core', ['nice meeting you', 'it was nice meeting you']),
      phrase('bye-06', 'Take care.', 'warm goodbye', 'core', ['take care']),
      phrase('bye-07', 'Catch you later.', 'casual goodbye', 'useful', ['catch you later', 'later']),
      phrase('bye-08', "Let's do this again soon.", 'suggest meeting again', 'useful', ["let's do this again", 'we should do this again']),
      phrase('bye-09', 'See you then.', 'confirm future meeting', 'core', ['see you then']),
    ],
  },
  {
    id: '11-dates-time-weather',
    number: 11,
    title: 'Dates, time, and weather',
    description: 'Use common American ways to say times, dates, and basic weather information.',
    phrases: [
      phrase('time-01', 'What time does it start?', 'ask for a start time', 'core', ['what time does it start', 'what time is it']),
      phrase('time-02', "It's at 6.", 'state a time', 'core', ["it's at six", 'at six']),
      phrase('time-03', "It's 1:30.", 'state a half-hour time', 'core', ["it's one thirty", 'one thirty']),
      phrase('time-04', "It's 1:45.", 'state a quarter-hour time', 'core', ["it's one forty-five", 'one forty-five']),
      phrase('time-05', 'May 31st.', 'say a date in American order', 'core', ['may thirty-first', 'may 31st']),
      phrase('time-06', 'What day is it?', 'ask for the day/date', 'useful', ['what day is it', "what's the date"]),
      phrase('time-07', 'Once a week.', 'talk about frequency', 'useful', ['once a week', 'twice a week']),
      phrase('time-08', 'Every month.', 'talk about frequency', 'useful', ['every month', 'every week']),
    ],
  },
  {
    id: '12-making-arrangements',
    number: 12,
    title: 'Making arrangements',
    description: 'Coordinate times and days using natural American scheduling language.',
    phrases: [
      phrase('arrange-01', 'Are you free Tuesday?', 'check availability', 'core', ['are you free tuesday', 'are you free on tuesday']),
      phrase('arrange-02', 'What time works for you?', 'ask for a convenient time', 'core', ['what time works for you', 'what time is good for you']),
      phrase('arrange-03', 'Can you pick me up at 11:45?', 'arrange pickup', 'useful', ['can you pick me up at', 'could you pick me up at']),
      phrase('arrange-04', 'I might be five minutes late.', 'warn about lateness', 'core', ['i might be five minutes late', 'running five minutes late']),
      phrase('arrange-05', 'Friday works for me.', 'accept a day', 'core', ['friday works for me', 'that works for me']),
      phrase('arrange-06', 'How about Sunday instead?', 'suggest another day', 'core', ['how about sunday instead', 'what about sunday instead']),
      phrase('arrange-07', "Let's make it 1:15.", 'set a time', 'core', ["let's make it", 'make it one fifteen']),
      phrase('arrange-08', 'Keep it open.', 'reserve a date/time', 'useful', ['keep it open', 'keep that day open']),
    ],
  },
  {
    id: '13-weather',
    number: 13,
    title: 'Talking about the weather',
    description: 'Handle everyday weather small talk in contemporary American English.',
    phrases: [
      phrase('weather-01', "What's it like outside?", 'ask about current weather', 'core', ["what's it like outside", "what's the weather like"]),
      phrase('weather-02', "It's freezing.", 'describe very cold weather', 'core', ["it's freezing", 'freezing out']),
      phrase('weather-03', "It's really windy.", 'describe wind', 'core', ["it's really windy", 'windy out']),
      phrase('weather-04', "It's pouring.", 'describe heavy rain', 'core', ["it's pouring", 'pouring out']),
      phrase('weather-05', "It's a little chilly today.", 'describe cool weather', 'core', ["it's a little chilly", 'kinda chilly']),
      phrase('weather-06', "It's hot out.", 'describe hot weather', 'core', ["it's hot out", 'really hot out']),
      phrase('weather-07', 'Looks like rain.', 'predict rain casually', 'core', ['looks like rain', "looks like it's gonna rain"]),
      phrase('weather-08', "The weather's been weird.", 'comment on unusual weather', 'useful', ["the weather's been weird", 'weird weather']),
      phrase('weather-09', "What's the temperature?", 'ask temperature', 'useful', ["what's the temperature", 'how warm is it']),
    ],
  },
]

export const EVERYDAY_ENGLISH_PHRASE_COUNT = EVERYDAY_ENGLISH_CHAPTERS.reduce(
  (total, chapter) => total + chapter.phrases.length,
  0,
)

export function getEverydayEnglishChapter(id: string | null | undefined): EverydayChapter | null {
  if (!id) return null
  return EVERYDAY_ENGLISH_CHAPTERS.find(chapter => chapter.id === id) || null
}
