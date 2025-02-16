'use client'
import { useState, useEffect } from 'react';
import 'bulma/css/bulma.css';
import 'bulma-calendar/dist/css/bulma-calendar.min.css'


import Web3 from 'web3'
import systemContract from './contract'


export default function Home() {
  const [web3, setWeb3] = useState()
  const [address, setAddress] = useState()
  const [sContract, setsContract] = useState()
  const [tasks, setTasks] = useState([]) // reversed
  const [requests, setRequests] = useState([]) // reversed

  useEffect(() => {
    updateState()
  }, [sContract])

  const updateState = () => {
    if (sContract) get_tasks()
    if (sContract) get_requests()
  }

  const check_certificate = async () => {
    try {
      const params = document.getElementById("check_input").value.split(":")
      const res = await sContract.methods.check_certificate(params[0],params[1]).call()
      console.log(res)
      if (res) {
        alert("Confirmed!")
      } else {
        alert("Invalid!")
      }
    } catch(err) {
      alert("Check error")
      console.log(err)
    }
  }

  const create_task = async () => {
    try {
      const res = await sContract.methods.create_task(
        document.getElementById("create_text").value,
        document.getElementById("create_participants").value.replace(/(\r\n|\n|\r)/gm, "").split(",").filter(a => a !== ''),
        document.getElementById("create_experts").value.replace(/(\r\n|\n|\r)/gm, "").split(","),
        document.getElementById("create_value").value*1000000000,
        new Date(document.getElementById("create_deadline").value).getTime()/1000
      ).send({from:address,maxPriorityFeePerGas:30500000000,gasLimit:3000000})
      updateState()
    } catch(err) {
      alert("Create error")
      console.log(err)
    }
  }

  const send_request = async (i) => {
    try {
      const res = await sContract.methods.send_request(
        i, document.getElementById("req-"+i).value
      ).send({from:address,maxPriorityFeePerGas:30500000000,gasLimit:3000000})
      updateState()
    } catch(err) {
      alert("Request error")
      console.log(err)
    }
  }

  const accept_request = async (i) => {
    try {
      console.log(i)
      const res = await sContract.methods.accept_request(i).send({from:address,maxPriorityFeePerGas:30500000000,gasLimit:3000000})
      updateState()
    } catch(err) {
      alert("Processing error")
      console.log(err)
    }
  }

  const reject_request = async (i) => {
    try {
      console.log(i)
      const res = await sContract.methods.reject_request(i).send({from:address,maxPriorityFeePerGas:30500000000,gasLimit:3000000})
      updateState()
    } catch(err) {
      alert("Processing error")
      console.log(err)
    }
  }

  const add_balance = async () => {
    try {
      const res = await sContract.methods.add_balance(
        document.getElementById("send_id").value
      ).send({from:address,maxPriorityFeePerGas:30500000000,gasLimit:3000000,value:document.getElementById("send_value").value*1000000000})
      updateState()
    } catch(err) {
      alert("Send error")
      console.log(err)
    }
  }

  const return_balance = async () => {
    try {
      const res = await sContract.methods.reject_request(
        document.getElementById("return_id").value
      ).send({from:address,maxPriorityFeePerGas:30500000000,gasLimit:3000000})
      updateState()
    } catch(err) {
      alert("Return error")
      console.log(err)
    }
  }

  const get_tasks = async () => {
      const tasks_n = await sContract.methods.get_tasks_count().call()
      var i;
      var t = []
      for (i = 0; i < tasks_n; i++) {
        var a = await sContract.methods.tasks(i).call()
        var b = await sContract.methods.get_task_users(i).call()
        t.push(Object.assign({}, a, b))
      }
      setTasks(t.reverse())
      console.log(tasks)
  }

  const get_requests = async () => {
    const tasks_n = await sContract.methods.get_requests_count().call()
    var i;
    var t = []
    for (i = 0; i < tasks_n; i++) {
      var a = await sContract.methods.requests(i).call()
      t.push(a)
    }
    setRequests(t.reverse())
    console.log(requests)
  }

  const openTab = (tabname) => {
    var i, tabcontent, tabbtns;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tabbtns = document.getElementsByClassName("tabbtn");
    for (i = 0; i < tabbtns.length; i++) {
      tabbtns[i].className = "tabbtn";
    }
    document.getElementById(tabname).style.display = "block";
    document.getElementById(tabname+"tab").className = "tabbtn is-active";
    updateState()
  }

    const connectWalletHandler = async () => {
      if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" })
          const web3 = new Web3(window.ethereum)
          setWeb3(web3)
          const accounts = await web3.eth.getAccounts()
          setAddress(accounts[0])
          
          const sc = systemContract(web3)
          setsContract(sc)

        } catch(err) {
          console.log(err.message)
        }
      } else {
        alert("MetaMask is not installed!")
      }
    }

  return (
    <div className="container">
      <main>
        <nav className="navbar">
          <div className="container">
            <div className="tabs is-centered is-boxed is-medium">
            <ul>
              <li className="is-active tabbtn" id="createtab">
                <a onClick={() => openTab("create")}><span>Create Task</span></a>
              </li>
              <li className="tabbtn" id="taskstab">
                <a onClick={() => openTab("tasks")}><span>Tasks</span></a>
              </li>
              <li className="tabbtn" id="reqtab">
                <a onClick={() => openTab("req")}><span>Requests</span></a>
              </li>
              <li className="tabbtn" id="checktab">
                <a onClick={() => openTab("check")}><span>Check certificate</span></a>
              </li>
            </ul>
            </div>
            <div className="navbar-divider"></div>
            <div className="navbar-end">
              <button onClick={connectWalletHandler} className="button is-link">Connect Wallet / Update</button>
            </div>
          </div>
        </nav>
        <div className="container has-background-black-bis">
        <div className="tabcontent" id="create">
        <div className="p-5">
        <div className="field">
          <label className="label">Task text:</label>
          <div className="control">
            <textarea className="textarea" placeholder="2+2=..." id="create_text"></textarea>
          </div>
        </div>
        <div className="fixed-grid has-2-cols">
        <div className="grid">
        <div className="field cell">
          <label className="label">Participants:</label>
          <div className="control">
            <textarea className="textarea" placeholder="0x..." id="create_participants"></textarea>
            <p className="help">Separated by comma, empty if task is open</p>
          </div>
        </div>
        <div className="field cell">
          <label className="label">Experts:</label>
          <div className="control">
            <textarea className="textarea" placeholder="0x..." id="create_experts"></textarea>
            <p className="help">Separated by comma</p>
          </div>
        </div>
        </div></div>
        <div className="columns">
        <div className="field column">
          <label className="label">Task reward:</label>
          <div className="control">
            <input className="input" type="text" placeholder="500" id="create_value"></input>
          </div>
          <p className="help">In GWei</p>
        </div>
        <div className="field column is-one-quarter">
          <label className="label">Deadline:</label>
          <div className="control">
            <input type="date" id="create_deadline"></input>
          </div>
          <p className="help">00:00 GMT</p>
        </div>
        <div className="field column">
        <div className="control">
        <button onClick={create_task} className="button is-link is-large is-fullwidth">Submit</button></div>
        </div>
        </div>
        <div className="columns">
        <div className="field column is-one-quarter">
          <label className="label">Task ID:</label>
          <div className="control">
            <input className="input" type="text" placeholder="0" id="send_id"></input>
          </div>
          <p className="help">You can check in Tasks tab</p>
        </div>
        <div className="field column">
          <label className="label">Add ETH to balance:</label>
          <div className="control">
            <input className="input" type="text" placeholder="50000" id="send_value"></input>
          </div>
          <p className="help">In GWei</p>
        </div>
        <div className="field column">
        <div className="control">
        <button onClick={add_balance} className="button is-link is-large is-fullwidth">Send</button></div>
        </div>
        <div className="field column is-one-quarter">
          <label className="label">Task ID:</label>
          <div className="control">
            <input className="input" type="text" placeholder="0" id="return_id"></input>
          </div>
          <p className="help">If your task has expired, you can return it's balance</p>
        </div>
        <div className="field column">
        <div className="control">
        <button onClick={return_balance} className="button is-link is-large is-fullwidth">Return</button></div>
        </div>
        </div>
        </div>
        </div>
        <div className="tabcontent" id="tasks" style={{display: 'none'}}>
          {
            (tasks && tasks.length > 0) && tasks.map((task, i) => {
              return (
                <div className="p-3" key={i}>
                  <div className="card">
                  <div className="card-content">
                  <div className="columns">
                    <div className="column">
                      <p className="title is-4">{tasks.length-i-1}: {task['text']}</p>
                    </div>
                    <div className="column is-one-quarter">
                      <p>{new Date(task['deadline'].toString() * 1000).toLocaleDateString()}</p>
                      <p>{task['value'].toString()/1000000000} GWei / {task['balance'].toString()/1000000000} GWei</p>
                    </div>
                  </div>
                  <div className="columns">
                    <div className="column">
                      <p className="title is-6">Participants:</p>
                      {task['0'].map((addr, i) => {
                        return <p key={i}>{addr}</p>
                      })}
                      {(task['0'].length == 0) && (<p>Open</p>)}
                    </div>
                    <div className="column">
                      <p className="title is-6">Experts:</p>
                      {task['1'].map((addr, i) => {
                        return <p key={i}>{addr}</p>
                      })}
                    </div>
                    <div className="column">
                      <p className="title is-6">Certificates:</p>
                      {task['2'].map((addr, i) => {
                        return <p key={i}>{tasks.length-i-1}:{addr}</p>
                      })}
                    </div>
                  </div>
                  <div className="columns">
                    <div className="column">
                      <div className="field">
                      <div className="control">
                        <input className="input" type="text" placeholder="Answer..." id={"req-"+(tasks.length-i-1)}></input>
                      </div>
                    </div>
                    </div>
                    <div className="column is-one-quarter">
                      <div className="field">
                        <div className="control">
                          <button onClick={() => send_request(tasks.length-i-1)} className="button is-link is-fullwidth">Submit</button>
                        </div>
                        {(task['0'].length > 0) && (!task['0'].includes(address)) && (<p className="help is-danger">You are not in the participants list</p>)}
                      </div>
                    </div>
                  </div>
                  </div>

                </div>
                </div>
              )
            })
          }
        </div>
        <div className="tabcontent" id="req" style={{display: 'none'}}>
        {
            (requests && requests.length > 0) && (tasks && tasks.length > 0) && requests.map((request, i) => {
              return (
                <div className="p-3" key={i}>
                  <div className="card">
                  <div className="card-content">
                  <div className="columns">
                    <div className="column">
                      <p className="title is-5">Answer: {request['text']}</p>
                      <p>{request['author']}</p>
                    </div>
                    <div className="column">
                      <p>{request['task_id'].toString()}: {tasks[tasks.length-parseInt(request['task_id'])-1]['text']}</p>
                    </div>
                    {(!request['processed']) && (<div className="column is-one-quarter">
                      <div className="control p-1">
                        <button onClick={() => accept_request(requests.length-i-1)} className="button is-link is-fullwidth">Accept</button>
                      </div>
                      <div className="control p-1">
                        <button onClick={() => reject_request(requests.length-i-1)} className="button is-link is-fullwidth">Reject</button>
                      </div>
                      {(tasks[tasks.length-parseInt(request['task_id'])-1]['1'].length > 0) && (!tasks[tasks.length-parseInt(request['task_id'])-1]['1'].includes(address)) && (<p className="help is-danger">You are not in the experts list</p>)}
                    </div>)}
                    {(request['processed']) && (<div className="column is-one-quarter">
                      <div className="p-2">
                        <span className="tag is-dark is-large">Processed</span>
                      </div>
                    </div>)}
                    </div>
                </div>
              </div>
              </div>
              )
            })
        }
      </div>
        <div className="tabcontent" id="check" style={{display: 'none'}}>
          <div className="p-5">
          <div className="columns">
          <div className="field column">
            <label className="label">Certificate:</label>
            <div className="control">
              <input className="input" type="text" placeholder="id:adress" id="check_input"></input>
            </div>
          </div>
          <div className="field column is-one-quarter">
          <div className="control">
          <button onClick={check_certificate} className="button is-link is-large is-fullwidth">Check</button></div>
          </div></div>
          </div>
        </div>
        </div>
      </main>
      <footer className="footer">
        <p>02.2025. For INT20H</p>
      </footer>
    </div>
  );
}
