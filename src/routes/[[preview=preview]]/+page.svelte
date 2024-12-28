<script lang='ts'>  


  // Create a 40x40 grid with random values between 0 and 1
  let grid = $state(Array(40).fill(0).map(() => 
    Array(40).fill(0).map(() => 1)
  ));

	const vertString = "0,22,-2;2,21,-3;2,22,-3;4,18,-1;5,16,-3;6,16,-3;6,17,-3;12,18,-3;12,19,-3;14,18,-2;15,20,-3;16,20,-3;17,18,-2;19,20,-3;20,18,-2;20,20,-3;22,20,-3;23,18,-2;23,20,-3;26,20,-2;27,22,-3;28,21,-3;28,22,-3;"

	const hoString = "1,25,-2;2,23,-3;3,23,-3;3,24,-3;4,17,-1;5,15,-3;6,15,-3;6,16,-3;8,2,-2;9,4,-3;10,3,-3;10,4,-3;22,10,-3;22,11,-3;22,22,-3;22,23,-3;22,35,-3;22,36,-3;23,11,-3;23,35,-3;24,1,-2;24,9,-2;24,22,-2;24,37,-2;26,3,-3;26,4,-3;";

	const sagString ="2,17,-1;2,29,-2;3,4,-2;4,16,-3;4,17,-3;4,18,-3;6,13,-3;6,14,-3;6,20,-3;6,21,-3;24,2,-3;24,3,-3;24,36,-3;24,37,-3;25,10,-3;25,11,-3;25,25,-3;25,26,-3;27,1,-2;27,10,-2;27,25,-2;27,38,-2;"

	const trapString ="0,0,-2;2,22,-2;3,1,-3;3,2,-3;4,2,-3;5,0,-1;5,4,-3;6,4,-3;8,1,-3;8,2,-3;10,5,-2;10,7,-3;10,8,-3;11,7,-3;11,26,-3;12,26,-3;16,0,-3;16,1,-3;21,21,-2;22,39,-0.005555555555555758;23,0,-2;23,39,-0.02499999999999969;24,38,-0.002777777777777546;24,39,-0.04555555555555557;25,38,-0.02444444444444449;25,39,-0.06722222222222207;26,37,-0.005555555555555758;26,38,-0.047222222222222276;26,39,-0.09000000000000008;27,37,-0.02663949466585458;27,38,-0.07111111111111112;27,39,-0.11388888888888848;28,36,-0.01388888888888884;28,37,-0.05444444444444452;28,38,-0.09611111111111126;28,39,-0.13888888888888906;29,35,-0.0005555555555554204;29,36,-0.040000000000000036;29,37,-0.08055555555555527;29,38,-0.12222222222222223;29,39,-0.1649999999999998;30,35,-0.0277777777777779;30,36,-0.06722222222222207;30,37,-0.10777777777777797;30,38,-0.1494444444444445;30,39,-0.19222222222222185;31,34,-0.01777777777777767;31,35,-0.05611111111111078;31,36,-0.09555555555555562;31,37,-0.1361111111111113;31,38,-0.17777777777777737;31,39,-0.22055555555555584;32,29,-2;32,33,-0.009999999999999787;32,34,-0.047222222222222276;32,35,-0.08555555555555516;32,36,-0.12499999999999978;32,37,-0.16555555555555523;32,38,-0.20722222222222197;32,39,-0.24999999999999956;33,14,-3;33,15,-3;33,32,-0.004444444444444695;33,33,-0.040555555555555234;33,34,-0.07777777777777728;33,35,-0.11611111111111083;33,36,-0.15555555555555545;33,37,-0.19611111111111112;33,38,-0.23777777777777764;33,39,-0.28055555555555567;34,31,-0.0011111111111110628;34,32,-0.03611111111111076;34,33,-0.07222222222222219;34,34,-0.10944444444444446;34,35,-0.14777777777777779;34,36,-0.18722222222222218;34,37,-0.22777777777777786;34,38,-0.26944444444444393;34,39,-0.31222222222222196;35,31,-0.03388888888888886;35,32,-0.068888888888889;35,33,-0.10499999999999998;35,34,-0.14222222222222225;35,35,-0.1805555555555558;35,36,-0.21999999999999997;35,37,-0.26055555555555565;35,38,-0.3022222222222224;35,39,-0.345;36,29,-0.0011111111111110628;36,30,-0.03388888888888886;36,31,-0.06777777777777749;36,32,-0.10277777777777763;36,33,-0.13888888888888906;36,34,-0.17611111111111089;36,35,-0.21444444444444422;36,36,-0.25388888888888883;36,37,-0.2944444444444445;36,38,-0.336111111111111;36,39,-0.3788888888888886;37,28,-0.004444444444444695;37,29,-0.03611111111111076;37,30,-0.068888888888889;37,31,-0.10277777777777763;37,32,-0.13777777777777778;37,33,-0.17388888888888876;37,34,-0.21111111111111103;37,35,-0.24944444444444414;37,36,-0.288888888888889;37,37,-0.3294444444444442;37,38,-0.3711111111111114;37,39,-0.41388888888888875;38,27,-0.009999999999999787;38,28,-0.040555555555555234;38,29,-0.07222222222222219;38,30,-0.10499999999999998;38,31,-0.13888888888888906;38,32,-0.17388888888888876;38,33,-0.20999999999999974;38,34,-0.24722222222222223;38,35,-0.2855555555555558;38,36,-0.32499999999999973;38,37,-0.36555555555555563;38,38,-0.40722222222222215;38,39,-0.4500000000000002;39,26,-0.01777777777777767;39,27,-0.047222222222222276;39,28,-0.07777777777777728;39,29,-0.10944444444444446;39,30,-0.14222222222222225;39,31,-0.17611111111111089;39,32,-0.21111111111111103;39,33,-0.24722222222222223;39,34,-0.2844444444444443;39,35,-0.3227777777777776;39,36,-0.3622222222222222;39,37,-0.4027777777777777;39,38,-0.4444444444444444;39,39,-0.4872222222222222;"
	let ballX = $state(0);
	let ballY = $state(0);

	let gridString = $state("")

	let mode = $state("B");

	let offensivePlayerCount = $state(1);

  // Function to update a cell value
  function setCell(row:number, col:number) {
		let val = 0
	
		if(mode==="O")
			val = -2;
		if(mode==="D")
			val = -3;

		if(grid[row][col]<0)
			val=0;

			if(mode==="B"){
		 grid[ballX][ballY] = 0;
			ballX=row;
			ballY=col;
			val = -1;
		}
		
    grid[row][col] = val;		
		calcGrid();
  }

	
function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function checkLineIntersectsWithDistance(x: number, y: number): number {
  let x1 = x, y1 = y, x2 = ballY, y2 = ballX;
  let minDistTo = Infinity;
  
  // Store original coordinates for distance calculations
  const startX = x1;
  const startY = y1;
  
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    if(grid[y][x] === -3) {
      // Calculate distance from original point to this  square
      const distTo = getDistance(startX, startY, x, y);
      minDistTo = Math.min(minDistTo, distTo);
    }
    
    if (x === x2 && y === y2) break;
    
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
  
  return minDistTo === Infinity ? -1 : minDistTo;
}

	function smoothGrid() {
  // Create a copy of the grid for the smoothing operation
  const tempGrid = grid.map(row => [...row]);
  
  // Kernel size for smoothing (3x3)
  const kernelSize = 1; // This means 1 cell in each direction
  
  for(let i = 0; i < grid.length; i++) {
    for(let j = 0; j < grid[i].length; j++) {
      // Skip special cells (ball,  squares, etc)
      if(tempGrid[i][j] < 0) continue;
      
      let sum = 0;
      let count = 0;
      
      // Apply smoothing kernel
      for(let di = -kernelSize; di <= kernelSize; di++) {
        for(let dj = -kernelSize; dj <= kernelSize; dj++) {
          const ni = i + di;
          const nj = j + dj;
          
          // Check bounds and skip special cells
          if(ni >= 0 && ni < grid.length && 
             nj >= 0 && nj < grid[i].length && 
             tempGrid[ni][nj] >= 0) {
            sum += tempGrid[ni][nj];
            count++;
          }
        }
      }

      if(count > 0) {
        grid[i][j] = sum / count;
      }
    }
  }
}

function calcGrid() {
  const maxDistance = Math.sqrt(Math.pow(40, 2) + Math.pow(40, 2)) * 0.75;
  
  for(let i = 0; i < grid.length; i++) {
    for(let j = 0; j < grid[i].length; j++) {
      if(grid[i][j] < 0) continue;
      
      const distanceToBall = getDistance(j, i, ballY, ballX);
      let brightness = 1 - (distanceToBall / maxDistance);
      
      const distanceTo = checkLineIntersectsWithDistance(j, i);
      
      if(distanceTo >= 0) {
        // Make shadows decay more quickly using a power function
        const shadowIntensity = Math.pow(1 - (distanceTo / maxDistance), 1.5); 
        brightness *= (1 - shadowIntensity * 1);
      }

      // Apply easing to the final brightness
      let brightnessEased = 1 - Math.pow(1 - brightness, 2);

      if(brightnessEased > 1)
        brightnessEased = 1;

			if(brightnessEased < 0)
        brightnessEased = 0;
      
      grid[i][j] = brightnessEased;
    }
  }

  smoothGrid();
}

	const clearCells = () => {
		grid = Array(40).fill(0).map(() => 
    Array(40).fill(0).map(() => 1)
																
  );

		
		
		ballX=0;
		ballY=0;

			grid[0][0]=-1;
	}

	function gridToString(): string {
  let result = '';
  for(let i = 0; i < grid.length; i++) {
    for(let j = 0; j < grid[i].length; j++) {
      // Only include special cells (ball=-1, O=-2, D=-3)
      if(grid[i][j] < 0) {
        // Format: y,x,value;
        result += `${i},${j},${grid[i][j]};`;
      }
    }
  }
		gridString = result;
  return result;
}

function loadFromString() {
  // Clear the grid first
  clearCells();
	grid[0][0]=0;
  
  // Parse the string and place cells
  const cells = gridString.split(';').filter(s => s);
  for(const cell of cells) {
    const [y, x, value] = cell.split(',').map(Number);
    grid[y][x] = value;
    
    // Update ball position if this is the ball
    if(value === -1) {
      ballY = x;
      ballX = y;
    }
  }
  
  calcGrid();
}

// Add buttons to UI

</script>

<div class="grid-container mx-auto aspect-square h-[50vh] lg:h-[80vh] mt-4">
  {#each grid as row, i}
    <div class="row">
      {#each row as cell, j}
        <button 
          class="cell" 
          style="{cell===-1?"background-color:red":""} 
								 {cell===-2?"background-color:#FFC000":""} 
								 {cell===-3?"background-color:#081857;":""} 
								 {cell>-1?"opacity:"+cell:""}"
          onclick={() => setCell(i, j)}
					aria-label="point"
        >
					{cell===-2?"o":cell===-3?"x":""}
				</button>
      {/each}
    </div>
  {/each}
</div>

<div style="margin-top: 10px" class="flex items-center justify-center gap-3">
	<button 
			style="color:black; cursor:pointer; {mode==="B"?"background-color:red":""}"
			onclick={()=>mode="B"}
		>
		Ball
	</button>
	<button 
			style="color:black; cursor:pointer; {mode==="O"?"background-color:#FFC003":""}"
			onclick={()=>mode="O"}
		>
		O
	</button>
	<button 
		style=" cursor:pointer; 
		{mode==="D"?"background-color:#081857;color:white;":"color:black;"}"
		onclick={()=>mode="D"}
		>
		D
	</button>
	<button 
		style="color:black; cursor:pointer;"
		onclick={clearCells}
	>
		Clear
	</button>
</div>
<div style="margin-top: 10px" class="flex items-center justify-center gap-3">
  <button 
    style="color: black; cursor: pointer;"
    onclick={() => {
      const str = gridToString();
      // Copy to clipboard
      navigator.clipboard.writeText(str);
      alert('Grid string copied to clipboard!');
    }}
  >
    Copy Grid String
  </button>
  
  <input 
    type="text" 
    placeholder="Paste grid string here"
    style="margin-left: 5px; padding: 2px; width: 200px;"
		bind:value={gridString}
  />

	<button 
    style="color: black; cursor: pointer;"
    onclick={loadFromString}
  >
    Load Grid From String
  </button>
</div>

<div style="margin-top: 10px" class="flex items-center justify-center gap-3">
	<button 
			onclick={()=>{
				gridString=vertString;
				loadFromString();
			}}
			style={gridString===vertString?"background-color:green;color:white":"color:black"}
		
		>
		Vert
	</button>
	<button 
			onclick={()=>{
				gridString=hoString;
				loadFromString();
			}}
			style={gridString===hoString?"background-color:green;color:white":"color:black"}
		
		>
		Ho
	</button>
	<button 
			onclick={()=>{
				gridString=sagString;
				loadFromString();
			}}
			style={gridString===sagString?"background-color:green;color:white":"color:black"}
		>
		Sag
	</button>
	<button 
			onclick={()=>{
				gridString=trapString;
				loadFromString();
			}}
			style={trapString===gridString?"background-color:green;color:white":"color:black"}
		>
		Z Trap
	</button>
	

</div>
<style>
  button, input {
    background-color: white;
    cursor: pointer;
    border: black 2px solid;
    padding: 6px 8px 4px 8px;
  }
  .grid-container {
    display: flex;
    flex-direction: column-reverse;
    border: 1px solid #ccc;
    padding: 4px;
    background-color: black;
    gap: 1px;
    aspect-ratio: square;
    position: relative;
    font-size: 12px;
    line-height: 1em;
  }

  .row {
    display: flex;
    gap: 1px;
  }

  .cell {
    width: 2.5%;
    aspect-ratio: 1;
    border: none;
    padding: 0;

    font-size: 11px;
    line-height: 10px;
    color:white;
  }

  .cell:hover {
    transform: scale(1.1);
    transition: transform 0.1s ease-in-out;
  }
</style>
