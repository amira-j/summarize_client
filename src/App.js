import logo from './ost.jpg';
import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Backdrop, Chip, CircularProgress, Grid, Stack, Button, FormControl, Select, InputLabel, MenuItem } from "@mui/material";
import TextField from '@mui/material/TextField';
import { DropzoneAreaBase } from "material-ui-dropzone";
import FormData from 'form-data';

function App() {
  const [getMessage, setGetMessage] = useState({})
  const [value, setValue] = useState('');
  const [resText, setResText] = useState('');
  const [minL, setMinL] = useState('');
  const [maxL, setMaxL] = useState('');
  const [file, setFile] = useState(null);
  const [newFile, setNewFile] = useState(true);
  const [model, setModel] = useState('fast');
  const [path, setPath] = useState('');
  const [resStatus, setResStatus] = useState('')
  const data = require('./models.json');

  useEffect(() => {
    axios.get('http://summarize.ost.ch/flask/hello').then(response => {
      console.log("SUCCESS", response)
      setGetMessage(response)
    }).catch(error => {
      console.log(error)
    })

  }, [])

  const handleChange = (event) => {
    setValue(event.target.value);
  }

  const handleMin = (event) => {
    setMinL(event.target.value);
  }

  const handleMax = (event) => {
    setMaxL(event.target.value);
  }

  const handleModel = async (event) => {
    const m = event.target.value
    await setModel(m)
    setPath(data.models.find(d => d.name === m)?.path)
  }

  const prepareForm = async () => {
    setResStatus('Sending.......');
    const form = new FormData();
    form.append('minL', minL);
    form.append('maxL', maxL);
    form.append('model', model);
    form.append('path', path);
    return form
  }

  const sendValue = async () => {
    const form = await prepareForm();
    form.append('text', value);
    const res = await axios.post('http://summarize.ost.ch/summarize/plaintext', form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).catch((err) => {
      setResStatus(`Error with the request: ${err}`)
    })
    handleResults(res)
  }

  const sendFile = async () => {
    const form = await prepareForm();
    form.append('file', file);
    let res;
    if (file.type == 'text/plain') {
      res = await axios.post('http://summarize.ost.ch/summarize/file', form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .catch((err) => {
        setResStatus(`Error with the request: ${err}`)
      })
    } else {
      res = await axios.post('http://summarize.ost.ch/summarize/pdf', form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .catch((err) => {
        setResStatus(`Error with the request: ${err}`)
      })
    }
    handleResults(res)
  }

  const handleFile = async (event) => {
    setFile(event[0].file);
    setNewFile(true);
  }

  const handleResults = async (res) => {
    if (res.data) {
      if (file) {
        setNewFile(false);
      }
      setValue(res.data['original'])
      setResText(res.data['summary'])
      setResStatus(`Summary generated with ${res.data['model']}${res.data['chunks'] > 1 ? ` in ${res.data.chunks} chunks` : ''}`)
    } else {
      console.log(res)
    }

  }

  const resetStates = async () => {
    setGetMessage('')
    setValue('')
    setResText('')
    setResStatus('')
    setFile(null)
    setMinL('')
    setMaxL('')
    setModel('auto')
    setPath('')
    setNewFile(true)
  }

  const copyToClipboard = async () => {
    navigator.clipboard.writeText(resText)
  }

  return (
    <div>
      <Grid container className="App" alignItems="center" justifyContent="center">
        <Grid item container direction="column" spacing={2} xs={10}>
          <Grid item xs={1} >
            <img src={logo} width={100} />
          </Grid>
          <Grid item container direction="row">
            <Grid item xs={6}>
              <TextField
                id="outlined-multiline-flexible"
                label="Original Text"
                multiline
                minRows={15}
                maxRows={15}
                value={value}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="outlined-multiline-flexible"
                label="Summary"
                multiline
                minRows={15}
                maxRows={15}
                value={resText}
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid container item direction="row" xs={1}>
            <Grid item container direction="row" xs={6}>
              <Grid item xs={2}>
                <TextField
                  id="outlined-multiline-flexible"
                  label="minimum Length"
                  value={minL}
                  onChange={handleMin}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  id="outlined-multiline-flexible"
                  label="maximum Length"
                  value={maxL}
                  onChange={handleMax}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={2}>
                <FormControl fullWidth>
                  <InputLabel> Model
                  </InputLabel>
                  <Select
                    value={model}
                    onChange={handleModel}>
                    {
                      data.models.map((d) => {
                        return <MenuItem value={d.name}>{d.name}</MenuItem>
                      })
                    }
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2}>
                <Button variant="contained" onClick={sendValue}>Send Text</Button>
              </Grid>
              <Grid item xs={2}> 
                <Button variant="contained" onClick={sendFile}>{!newFile ? 'Resend File' : 'Send File'}</Button>
              </Grid>
              <Grid item xs={1}>
                <Button variant="contained" onClick={resetStates}>Reset</Button>
              </Grid>
              <Grid item xs={1}>
                <Button variant="contained" onClick={copyToClipboard}>Copy</Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid container item direction="row" xs={2}>
            <Grid item xs={6}>
              <TextField
                id="outlined-multiline-flexible"
                multiline
                label={"Description"}
                minRows={3}
                maxRows={3}
                value={data.models.find(d => d.name === model)?.description}
                fullWidth
                inputProps={
                  { readOnly: true, }
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="outlined-multiline-flexible"
                multiline
                label={"Description"}
                minRows={3}
                maxRows={3}
                value={resStatus}
                fullWidth
                inputProps={
                  { readOnly: true, }
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
          <Grid item container xs={6}>
            <Grid item xs={3}>
              <DropzoneAreaBase
                acceptedFiles={[".txt", ".pdf"]}
                dropzoneText={file ? file.name : 'Add a file'}
                onAdd={handleFile}
                maxFileSize={10000000}
                filesLimit={1}
                showAlerts={["error"]}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
