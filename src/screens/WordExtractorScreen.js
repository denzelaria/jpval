import React, { useState, useEffect } from 'react'
import { Button, Container, Row, Col, Form } from 'react-bootstrap'
import { GoogleGenAI } from "@google/genai"
import LoadingComponent from '../components/LoadingComponent'
import { partOfSpeech } from '../assets/part_of_speech'
import { exclusions } from '../assets/part_of_speech'

function WordExtractorScreen() {
  const [working, setWorking] = useState(false)
  const [sentence, setSentence] = useState("")
  const [done, setDone] = useState(false)
  const [type, setType] = useState(0)
  const [results, setResults] = useState([])
  const [dictionary, setDictionary] = useState({})
  const [dictionaryLoaded, setDictionaryLoaded] = useState(false)
  const [tokenizer, setTokenizer] = useState(null)
  const [translation, setTranslation] = useState("")
  const [error, setError] = useState("")
  const [change, setChange] = useState(false)
  const [open, setOpen] = useState(false)  
  
  const analyze = async (sentence) => {
    setWorking(true)
    setDone(false)
    try {
        if (!tokenizer) {
            alert('Japanese analyzer is not ready yet.')
            return
        }
        if (!dictionaryLoaded) {
            alert('Dictionary is still loading. Please wait...')
            return
        }
        const tokens = await tokenizer.tokenize(sentence)
        const foundResults = (await Promise.all(
            tokens.map(token => getMeaning(token))
        )).filter(result => result !== undefined);
        setResults(foundResults)
        setWorking(false)
        setDone(true)
    }catch(error) {
        alert(error)
        setWorking(false)
        setDone(false)
        setError("Error with dictionary. Please try again later.")
    }
  }

  const getTranslation = async (sentence) => {
    try {
        const res = await fetch(
            `https://lingva.ml/api/v1/ja/en/${encodeURIComponent(sentence)}`
        );
        setTranslation((await res.json()).translation)
    }catch(error) {
        alert(error)
        setWorking(false)
        setDone(false)
        setError("Translation failed. Please try again later.")
    }
  }

  const getMeaning = (word) => {
    const isKatakana = (text) => /^[\u30A0-\u30FF]+$/.test(text);
    const q = dictionary.filter(item => {
        if (isKatakana(word.basic_form)) {
            return item.kana?.some(kanaObj => kanaObj.text === word.basic_form);
        } else {
            return item.kanji?.some(kanjiObj => kanjiObj.text === word.basic_form)
        }
    });
    if (q.length > 0) {
        const poss = []
        q[0].sense[0].partOfSpeech.map((pos) => 
          poss.push(pos in partOfSpeech && !(exclusions.includes(pos)) && !(poss.includes(partOfSpeech[pos])) ? partOfSpeech[pos] : null)
        )
        return {
            word: word.basic_form,
            reading: q[0].kana[0].text,
            meaning: q[0].sense[0].gloss[0].text,
            pos: poss.filter(p => p != null)
        }
    }
    return
  }

  const submitHandler = async (e) => {
    try {
        e.preventDefault()
        if (sentence.length === 0) {
            alert("Please enter something")
        }else {
            setError("")
            setDone(false)
            setWorking(true)
          }
        analyze(sentence)
        await getTranslation(sentence)
        setDone(true)
        setWorking(false)
    }catch(error) {
      alert(error)
      setDone(false)
      setWorking(false)
      setError("Error occured. AI may be experiencing too much requests or is temporarily shut down. Please try again later (should work after a few seconds to a minute)")
    }
  }

  useEffect(() => {
      const initializeKuromoji = () => {
          if (typeof window.kuromoji === 'undefined') {
            setTimeout(initializeKuromoji, 1000); 
            return;
          }
          
          window.kuromoji.builder({ 
            dicPath: "/dict/" 
            }).build(function (err, newTokenizer) {
            if (err) {
                console.error('Kuromoji initialization error:', err);
                alert('Failed to load analyzer.');
                return;
            }
            setTokenizer(newTokenizer);
          });
      };
      const loadDictionary = async () => {
          try {
              const response = await fetch('/data/jmdict-eng-common-3.6.1.json')
              if (!response.ok) {
                  throw new Error(`Failed to load dictionary: ${response.status}`)
              }
              const data = await response.json()
              if (data.words) {
                  setDictionary(data.words)
              }else {
                  setDictionary(data)
              }
              setDictionaryLoaded(true)
          }catch(error) {
              setDictionaryLoaded(true)
          }
      }
      initializeKuromoji();
      loadDictionary();
  }, []);

  return (
    <div className="" style={{width:"75vw"}}>
      <Container fluid className="w-100 justify-content-center text-center p-5">
        <Row>
          <Col>
            <h1 className="text-dark fw-bolder mb-3">Word extractor</h1>
            <p className="text-muted jakarta">Split a sentence and get their dictionary definitions<br></br>(may not be very accurate)</p>
          </Col>
        </Row>
      </Container>
        <Container fluid className="w-100 justify-content-center text-center p-4 bg-pure-white rounded shadow-sm">
          <Form onSubmit={(e) => submitHandler(e)}>
            <Row>
              <Col className="text-start">
                <Form.Group>
                  <Form.Label className="text-dark fw-medium jakarta">Input text</Form.Label>
                  <Form.Control className="bg-grey border-0" as="textarea" rows={5} value={sentence} onChange={(e) => setSentence(e.target.value)}></Form.Control>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-4">
              <Col className="text-center text-md-end">
                <Button className="btns jakarta d-inline-block w-auto bg-secondary border-0 rounded px-4 py-2" type="submit">Submit</Button>
              </Col>
            </Row>
          </Form>
        </Container>
      { working &&
        <Container fluid className="d-flex justify-content-center align-items-center w-100 m-0 mt-4 p-0　rounded bg-pure-white p-4 shadow-sm">
          <LoadingComponent textput="Generating.."></LoadingComponent>
        </Container>
      }
      { translation &&
        <Container fluid className="border-bottom border-4 border-secondary mt-4 d-flex flex-column justify-content-center align-items-center text-center p-4 bg-pure-white rounded shadow-sm">
          <p className="fw-medium jakarta text-dark">Translation</p>
          <Container fluid className="w-100 bg-grey border-0 p-2 rounded">
            <p className="m-0 text-start">{translation}</p>
          </Container>
        </Container>
      }
      <Row fluid className="w-100 p-0 m-0 justify-content-center items-center g-4">
        { results &&
          results.map((result, index) =>
            <Col className="m-0 mt-4" md={4} sm={6} xs={12} key={index}>
              <Container className="m-0 p-4 d-flex bg-pure-white shadow-sm rounded justify-content-center align-items-start flex-column">
                <p className="d-flex flex-row">
                  <ruby className="text-dark">
                    { result.word }
                    { result.reading && 
                      <rt>{result.reading}</rt>
                    }
                  </ruby>
                  {
                    result.pos.map((pos) => 
                      <div className="d-flex justify-content-center align-items-center rounded-pill bg-grey ms-1 my-0 px-2 py-0 extra-small">
                        {pos}
                      </div>
                    )
                  }
                </p>
                <div className="p-0 m-0 mt-1 ps-2 border-2 border-start">
                  <p className="text-muted m-0 p-0 extra-small">{result.meaning.charAt(0).toUpperCase() + result.meaning.slice(1)}</p>
                </div>
              </Container>
            </Col>
          )
        }
      </Row>
    </div>
  )
}

export default WordExtractorScreen