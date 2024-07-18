document.addEventListener('DOMContentLoaded', () => {
    // DOM 요소 가져오기
    const addFriendButton = document.getElementById('add-friend');
    const friendNameInput = document.getElementById('friend-name');
    const findDegreesButton = document.getElementById('find-degrees-button');
    const friend1Select = document.getElementById('friend1-select');
    const friend2Select = document.getElementById('friend2-select');
    const degreesResult = document.getElementById('degrees-result');
    const connectionPath = document.getElementById('connection-path');
    const canvas = document.getElementById('visualization');
    const ctx = canvas.getContext('2d');
  
    // 데이터 구조 초기화
    let nodes = [];
    let edges = [];
    let friendId = 1;
    let selectedNode = null;
    let isDragging = false;
    let dragNode = null;
  
    // 캔버스 크기 설정
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  
    // 네트워크 시각화 그리기 함수
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        edges.forEach(edge => {
            const fromNode = nodes.find(node => node.id === edge.from);
            const toNode = nodes.find(node => node.id === edge.to);
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.strokeStyle = 'black';
            ctx.stroke();
        });
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
            ctx.fillStyle = node === selectedNode ? '#cce5ff' : '#97c2fc';
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '12px Roboto';
            ctx.fillText(node.label, node.x, node.y);
        });
    }
  
    // 친구 목록에 추가 함수
    function addFriendToSelect(friendNode) {
        const option1 = document.createElement('option');
        option1.value = friendNode.id;
        option1.textContent = friendNode.label;
        friend1Select.appendChild(option1);
  
        const option2 = document.createElement('option');
        option2.value = friendNode.id;
        option2.textContent = friendNode.label;
        friend2Select.appendChild(option2);
    }
  
    // 엣지 존재 확인 함수
    function edgeExists(from, to) {
        return edges.some(edge => (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from));
    }
  
    // 친구 단계 수 찾기 함수
    function findDegreesOfSeparation(startNodeId, endNodeId) {
        const visited = {};
        const queue = [[startNodeId, 0, [startNodeId]]];
        while (queue.length > 0) {
            const [currentNode, degrees, path] = queue.shift();
            if (currentNode === endNodeId) return { degrees, path };
            visited[currentNode] = true;
            const neighbors = edges
                .filter(edge => edge.from === currentNode || edge.to === currentNode)
                .map(edge => (edge.from === currentNode ? edge.to : edge.from));
            neighbors.forEach(neighbor => {
                if (!visited[neighbor]) {
                    queue.push([neighbor, degrees + 1, [...path, neighbor]]);
                }
            });
        }
        return { degrees: -1, path: [] };
    }
  
    // 캔버스 클릭 이벤트 핸들러
    canvas.addEventListener('mousedown', (event) => {
        const { offsetX, offsetY } = event;
        const clickedNode = nodes.find(node => Math.hypot(node.x - offsetX, node.y - offsetY) < 20);
        if (clickedNode) {
            isDragging = true;
            dragNode = clickedNode;
        }
    });
  
    // 캔버스 드래그 이벤트 핸들러
    canvas.addEventListener('mousemove', (event) => {
        if (isDragging && dragNode) {
            const { offsetX, offsetY } = event;
            dragNode.x = offsetX;
            dragNode.y = offsetY;
            draw();
        }
    });
  
    // 캔버스 마우스 업 이벤트 핸들러
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        dragNode = null;
    });
  
    // 캔버스 클릭 이벤트 핸들러
    canvas.addEventListener('click', (event) => {
        const { offsetX, offsetY } = event;
        const clickedNode = nodes.find(node => Math.hypot(node.x - offsetX, node.y - offsetY) < 20);
        if (clickedNode) {
            if (selectedNode === null) {
                selectedNode = clickedNode;
            } else {
                if (clickedNode !== selectedNode) {
                    if (edgeExists(selectedNode.id, clickedNode.id)) {
                        edges = edges.filter(edge => !(edge.from === selectedNode.id && edge.to === clickedNode.id) && !(edge.from === clickedNode.id && edge.to === selectedNode.id));
                    } else {
                        edges.push({ from: selectedNode.id, to: clickedNode.id });
                    }
                }
                selectedNode = null;
            }
            draw();
        }
    });
  
    // 친구 추가 버튼 클릭 이벤트 핸들러
    addFriendButton.addEventListener('click', () => {
        const friendName = friendNameInput.value.trim();
        if (friendName) {
            // 중복된 이름 확인
            if (nodes.some(node => node.label === friendName)) {
                friendNameInput.value = ''; // 입력란 비우기
                return;
            }
            const x = Math.random() * (canvas.width - 40) + 20; // 랜덤 X 좌표 (프레임 안에 생성)
            const y = Math.random() * (canvas.height - 40) + 20; // 랜덤 Y 좌표 (프레임 안에 생성)
            const friendNode = { id: friendId, label: friendName, x: x, y: y };
            nodes.push(friendNode);
            addFriendToSelect(friendNode);
            friendNameInput.value = '';
            friendId++;
            draw();
        }
    });
  
    // 친구 단계 수 찾기 버튼 클릭 이벤트 핸들러
    findDegreesButton.addEventListener('click', () => {
        const friend1Id = parseInt(friend1Select.value);
        const friend2Id = parseInt(friend2Select.value);
  
        if (friend1Id && friend2Id) {
            const result = findDegreesOfSeparation(friend1Id, friend2Id);
            if (result.degrees !== -1) {
                // 단계 수 표시를 위한 요소 생성
                degreesResult.innerHTML = `
                    <div class="result-container">
                        두 친구는 <span class="degree-number">${result.degrees}</span>
                        <span class="degree-text">단계로 연결되어 있습니다</span>
                    </div>`;
                
                // 경로 시각화를 위한 요소 생성
                const pathLabels = result.path.map(id => nodes.find(node => node.id === id).label);
                connectionPath.innerHTML = `
                    <div class="path-container">
                        ${pathLabels.map((label, index) => `
                            <span class="path-node">${label}</span>
                            ${index < pathLabels.length - 1 ? '<span class="path-arrow">→</span>' : ''}
                        `).join('')}
                    </div>`;
            } else {
                degreesResult.textContent = '두 친구는 연결되어 있지 않습니다.';
                connectionPath.textContent = '';
            }
        } else {
            degreesResult.textContent = '두 친구 모두를 선택해야 합니다.';
            connectionPath.textContent = '';
        }
    });
  });
  