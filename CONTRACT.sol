// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;


contract TasksSystem {
    struct Task {
        address owner;
        string text;
        address[] participants;
        address[] experts;
        uint value;
        uint balance;
        uint deadline;
        address[] certificates;
    }

    struct Request {
        address author;
        uint task_id;
        string text;
        bool processed;
    }

    Task[] public tasks;
    Request[] public requests;


    function check_for_participant(uint task_id, address user) public view returns (bool) {
        if (tasks[task_id].participants.length == 0) return true;
        for (uint i = 0; i < tasks[task_id].participants.length; i++) {
            if (tasks[task_id].participants[i] == user) {
                return true;
            }
        }
        return false;
    }

    function check_for_expert(uint task_id, address user) public view returns (bool) {
        for (uint i = 0; i < tasks[task_id].experts.length; i++) {
            if (tasks[task_id].experts[i] == user) {
                return true;
            }
        }
        return false;
    }


    function create_task(string memory text, address[] memory participants, 
        address[] memory experts, uint value, uint deadline) public {
            tasks.push(Task(msg.sender, text, participants, experts, value, 0, deadline, new address[](0)));
    }
    
    function send_request(uint task_id, string memory text) public {
        require(check_for_participant(task_id, msg.sender), "You are not in the participants list for this task.");
        require(block.timestamp <= tasks[task_id].deadline, "You missed the task deadline.");
        require(!check_certificate(task_id, msg.sender), "You have already done this task.");
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].author == msg.sender && requests[i].task_id == task_id) {
                requests[i].processed = true;
            }
        }
        requests.push(Request(msg.sender, task_id, text, false));
    }


    function add_balance(uint task_id) payable public {
        require(block.timestamp <= tasks[task_id].deadline, "This task has expired.");
        tasks[task_id].balance += msg.value;
    }

    function return_balance(uint task_id) public {
        require(msg.sender == tasks[task_id].owner, "You are not this task owner.");
        require(block.timestamp > tasks[task_id].deadline, "This task has not expired yet.");
        uint _balance = tasks[task_id].balance;
        tasks[task_id].balance = 0;
        payable(tasks[task_id].owner).transfer(_balance);
    }


    function accept_request(uint req_id) public {
        require(check_for_expert(requests[req_id].task_id, msg.sender), "You are not in the experts list for this task.");
        require(!requests[req_id].processed, "This request is already processed.");
        tasks[requests[req_id].task_id].certificates.push(requests[req_id].author);
        requests[req_id].processed = true;
        if (tasks[requests[req_id].task_id].value <= tasks[requests[req_id].task_id].balance) {
            tasks[requests[req_id].task_id].balance -= tasks[requests[req_id].task_id].value;
            payable(requests[req_id].author).transfer(tasks[requests[req_id].task_id].value);
        }
    }

    function reject_request(uint req_id) public {
        require(check_for_expert(requests[req_id].task_id, msg.sender), "You are not in the experts list for this task.");
        requests[req_id].processed = true;
    }


    function check_certificate(uint task_id, address user) public view returns (bool) {
        for (uint i = 0; i < tasks[task_id].certificates.length; i++) {
            if (tasks[task_id].certificates[i] == user) {
                return true;
            }
        }
        return false;
    }


    function get_tasks_count() public view returns (uint) {
        return tasks.length;
    }

    function get_task_users(uint task_id) public view returns (address[] memory, address[] memory, address[] memory) {
        return(tasks[task_id].participants, tasks[task_id].experts, tasks[task_id].certificates);
    }

    function get_requests_count() public view returns (uint) {
        return requests.length;
    }
}
