Template.cwPlayer.rendered = (function() {
    function printGrid(a) {
        $("#cwContent").html(a);
    }
    function printLegent(a) {
        $("#cwContent").html(b);
    }
    function getAndUpdate(callback) {
        var noAnsGrid = getCw().gridWithoutAns;
        setTimeout(function() {
            callback(noAnsGrid);
        }, 5000);
        
    }
    getAndUpdate(printGrid);    
});

function getCw(wo, hi) {
	let words = ["apple","pale", "elephant", "cat","dog", "donkey","fish","giraffe", "hyena", "oerfdkbull", "kangaroo", "cantaloupe", "pomegranate", "gravitate","orange","assiduous"];
	let hints = ["a","b", "c", "a","a", "a", "a","b", "c", "a","a", "a", "a","b","s","b"];
	// console.log(words);

	let cw = new Crossword(words, hints);

	console.log(cw);

	let grid = cw.getSquareGrid(100000);
	if (cw.getBadWords()) {
		console.log(cw.getBadWords());
	}
	
	var vals = {'gridLength': grid.length,
				'gridWidth': grid.width,
                'gridArray': CrosswordCells.toArrayOfCells(grid),
				'gridWithoutAns': CrosswordUtils.toHtml(grid, false),
				'gridWithAns': CrosswordUtils.toHtml(grid, true),
				'gridLegend': cw.getLegend(grid)};

	return vals;
	// return CrosswordUtils.toHtml(grid, false);
	// console.log(CrosswordUtils.toHtml(grid, true));
	// console.log(cw.getLegend(grid));
	// console.log(CrosswordCells.toArrayOfCells(grid));
	
}





function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}
// Each cell on the crossword grid is null or one of these
function CrosswordCell(letter){
    this.char = letter; // the actual letter for the cell on the crossword
    // If a word hits this cell going in the "across" direction, this will be a CrosswordCellNode
    this.across = null; 
    // If a word hits this cell going in the "down" direction, this will be a CrosswordCellNode
    this.down = null;
}

// You can tell if the Node is the start of a word (which is needed if you want to number the cells)
// and what word and clue it corresponds to (using the index)
function CrosswordCellNode(is_start_of_word, index){
    this.is_start_of_word = is_start_of_word;
    this.index = index; // use to map this node to its word or clue
}

function WordElement(word, index){
    this.word = word; // the actual word
    this.index = index; // use to map this node to its word or clue
}

function Crossword(words_in, clues_in){
    var GRID_ROWS = 50;
    var GRID_COLS = 50;
    // This is an index of the positions of the char in the crossword (so we know where we can potentially place words)
    // example {"a" : [{'row' : 10, 'col' : 5}, {'row' : 62, 'col' :17}], {'row' : 54, 'col' : 12}], "b" : [{'row' : 3, 'col' : 13}]} 
    // where the two item arrays are the row and column of where the letter occurs
    var char_index = {};	

    // these words are the words that can't be placed on the crossword
    var bad_words;

    // returns the crossword grid that has the ratio closest to 1 or null if it can't build one
    this.getSquareGrid = function(max_tries){
        var best_grid = null;
        var best_ratio = 0;
        for(var i = 0; i < max_tries; i++){
            var a_grid = this.getGrid(1);
            if(a_grid == null) continue;
            var ratio = Math.min(a_grid.length, a_grid[0].length) * 1.0 / Math.max(a_grid.length, a_grid[0].length);
            if(ratio > best_ratio){
                best_grid = a_grid;
                best_ratio = ratio;
            }

            if(best_ratio == 1) break;
        }
        return best_grid;
    }

    this.getGridWithMaximizedIntersections = function(max_tries){
        var best_grid = null;
        var best_intersections = 0;
        for(var i = 0; i < max_tries; i++){
            var a_grid = this.getGrid(1);
            if(a_grid == null) continue;
            var intersections = a_grid.intersections;
            if(intersections > best_intersections){
                best_grid = a_grid;
                best_intersections = intersections;
                //console.log(intersections);
            }
        }
        return best_grid;
    }

    // returns an abitrary grid, or null if it can't build one
    this.getGrid = function(max_tries){
        for(var tries = 0; tries < max_tries; tries++){
            //shuffle(word_elements);
            clear(); // always start with a fresh grid and char_index
            // place the first word in the middle of the grid
            var start_dir = randomDirection();
            var r = Math.floor(grid.length / 2);
            var c = Math.floor(grid[0].length / 2);
            var word_element = word_elements[0];
            if(start_dir == "across"){
                c -= Math.floor(word_element.word.length/2);
            } else {
                r -= Math.floor(word_element.word.length/2);
            }

            if(canPlaceWordAt(word_element.word, r, c, start_dir) !== false){
                placeWordAt(word_element.word, word_element.index, r, c, start_dir);
            } else {
                bad_words = [word_element];
                return;
                //throw 'Cannot place first word: ' + word_element.word + ' at ' + r + ', ' + c + ' (make the grid bigger)';
            }

            // initialize the max and min bounds around the words on the grid 
            // so we can shrink wrap the grid around the words later
            if(start_dir == "across"){
                var r_max = r;
                var c_max = c + word_elements[0].word.length - 1;
            } else {
                var r_max = r + word_elements[0].word.length - 1;
                var c_max = c; 
            }
            var r_min = r;
            var c_min = c; 			

            // start with a group containing all the words (except the first)
            // as we go, we try to place each word in the group onto the grid
            // if the word can't go on the grid, we add that word to the next group 
            var intersections = 0;
            var groups = [];
            groups.push(word_elements.slice(1));
            for(var g = 0; g < groups.length; g++){
                word_has_been_added_to_grid = false;
                // try to add all the words in this group to the grid
                for(var i = 0; i < groups[g].length; i++){
                    var word_element = groups[g][i]; 
                    var best_position = findBestPositionForWord(word_element.word);
                    if(!best_position){ 
                        // make the new group (if needed)
                        if(groups.length - 1 == g) groups.push([]);
                        // place the word in the next group
                        groups[g+1].push(word_element);
                    } else {
                        intersections += best_position.intersections;
                        var r = best_position["row"], c = best_position["col"], dir = best_position['direction'];
                        placeWordAt(word_element.word, word_element.index, r, c, dir);
                        word_has_been_added_to_grid = true;						
                        // keep track of grid bounds
                        if(dir == "across"){
                            if(r > r_max) r_max = r;
                            if(c + word_element.word.length > c_max) c_max = c + word_element.word.length - 1;
                        } else {
                            if(r + word_element.word.length > r_max) r_max = r + word_element.word.length - 1;
                            if(c > c_max) c_max = c;
                        }						
                        if(r < r_min) r_min = r;						
                        if(c < c_min) c_min = c;							
                    }
                }
                // if we haven't made any progress, there is no point in going on to the next group
                if(!word_has_been_added_to_grid) break;
            }
            // no need to try again
            if(word_has_been_added_to_grid) {
                var g = minimizeGrid(r_min, r_max, c_min, c_max);
                g.intersections = intersections;
                return g;
            }
        }

        bad_words = groups[groups.length - 1];
        return null;
    }

    // returns the list of WordElements that can't fit on the crossword
    this.getBadWords = function(){
        return bad_words;
    }

    this.getLegend = function(grid){
        var groups = {"across" : [], "down" : []};
        var position = 1;
        for(var r = 0; r < grid.length; r++){	
            for(var c = 0; c < grid[r].length; c++){
                var cell = grid[r][c];
                var increment_position = false;
                // check across and down
                for(var k in groups){
                    // does a word start here? (make sure the cell isn't null, first)
                    if(cell && cell[k] && cell[k]['is_start_of_word']){
                        var index = cell[k]['index'];
                        groups[k].push({"position" : position, "index" : index, "clue" : clues_in[index], "word" : words_in[index]});
                        increment_position = true;
                    }
                }

                if(increment_position) position++;
            }
        }
        return groups;
    }	

    // move the grid onto the smallest grid that will fit it
    var minimizeGrid = function(r_min, r_max, c_min, c_max){
        // initialize new grid
        var rows = r_max - r_min + 1; 
        var cols = c_max - c_min + 1; 
        var new_grid = new Array(rows);
        for(var r = 0; r < rows; r++){
            for(var c = 0; c < cols; c++){
                new_grid[r] = new Array(cols);
            }
        }

        for(var r = r_min, r2 = 0; r2 < rows; r++, r2++){
            for(var c = c_min, c2 = 0; c2 < cols; c++, c2++){
                new_grid[r2][c2] = grid[r][c];
            }
        }

        return new_grid;
    }

    // helper for placeWordAt();
    var addCellToGrid = function(word, index_of_word_in_input_list, index_of_char, r, c, direction){
        var char = word.charAt(index_of_char);
        if(grid[r][c] == null){
            grid[r][c] = new CrosswordCell(char);

            // init the char_index for that character if needed
            if(!char_index[char]) char_index[char] = [];

            // add to index
            char_index[char].push({"row" : r, "col" : c});
        }

        var is_start_of_word = index_of_char == 0;
        grid[r][c][direction] = new CrosswordCellNode(is_start_of_word, index_of_word_in_input_list);
    }	

    // place the word at the row and col indicated (the first char goes there)
    // the next chars go to the right (across) or below (down), depending on the direction
    var placeWordAt = function(word, index_of_word_in_input_list, row, col, direction){
        if(direction == "across"){
            for(var c = col, i = 0; c < col + word.length; c++, i++){
                addCellToGrid(word, index_of_word_in_input_list, i, row, c, direction);
            }
        } else if(direction == "down"){
            for(var r = row, i = 0; r < row + word.length; r++, i++){
                addCellToGrid(word, index_of_word_in_input_list, i, r, col, direction);
            }			
        } else {
            throw "Invalid Direction";	
        }
    }

    // you can only place a char where the space is blank, or when the same character exists there already
    // and the row and col are inside the grid
    // returns false, if you can't place the char
    // 0 if you can place the char, but there is no intersection
    // 1 if you can place the char, and there is an intersection
    var canPlaceCharAt = function(char, row, col){
        // no intersection
        if(grid[row][col] == null) return 0;
        // intersection!
        if(grid[row][col]['char'] == char) return 1;

        return false;
    }

    // determines if you can place a word at the row, column in the direction
    var canPlaceWordAt = function(word, row, col, direction){
        // out of bounds
        if(row < 0 || row >= grid.length || col < 0 || col >= grid[row].length) return false;

        if(direction == "across"){
            // out of bounds (word too long)
            if(col + word.length > grid[row].length) return false;
            // can't have a word directly to the left
            if(col - 1 >= 0 && grid[row][col - 1] != null) return false;
            // can't have word directly to the right
            if(col + word.length < grid[row].length && grid[row][col+word.length] != null) return false;

            // check the row above to make sure there isn't another word running parallel
            // it is ok if there is a character above, only if the character below it intersects with the current word
            for(var r = row - 1, c = col, i = 0; r >= 0 && c < col + word.length; c++, i++){
                var is_empty = grid[r][c] == null;
                var is_intersection = grid[row][c] != null && grid[row][c]['char'] == word.charAt(i);
                var can_place_here = is_empty || is_intersection;
                if(!can_place_here) return false;
            }

            // same deal as above, we just search in the row below the word
            for(var r = row + 1, c = col, i = 0; r < grid.length && c < col + word.length; c++, i++){
                var is_empty = grid[r][c] == null;
                var is_intersection = grid[row][c] != null && grid[row][c]['char'] == word.charAt(i);
                var can_place_here = is_empty || is_intersection;
                if(!can_place_here) return false;
            }

            // check to make sure we aren't overlapping a char (that doesn't match)
            // and get the count of intersections
            var intersections = 0;
            for(var c = col, i = 0; c < col + word.length; c++, i++){
                var result = canPlaceCharAt(word.charAt(i), row, c);
                if(result === false) return false;
                intersections += result;
            }
        } else if(direction == "down"){
            // out of bounds
            if(row + word.length > grid.length) return false;
            // can't have a word directly above
            if(row - 1 >= 0 && grid[row - 1][col] != null) return false;
            // can't have a word directly below
            if(row + word.length < grid.length && grid[row+word.length][col] != null) return false;

            // check the column to the left to make sure there isn't another word running parallel
            // it is ok if there is a character to the left, only if the character to the right intersects with the current word
            for(var c = col - 1, r = row, i = 0; c >= 0 && r < row + word.length; r++, i++){
                var is_empty = grid[r][c] == null;
                var is_intersection = grid[r][col] != null && grid[r][col]['char'] == word.charAt(i);
                var can_place_here = is_empty || is_intersection;
                if(!can_place_here) return false;
            }

            // same deal, but look at the column to the right
            for(var c = col + 1, r = row, i = 0; r < row + word.length && c < grid[r].length; r++, i++){
                var is_empty = grid[r][c] == null;
                var is_intersection = grid[r][col] != null && grid[r][col]['char'] == word.charAt(i);
                var can_place_here = is_empty || is_intersection;
                if(!can_place_here) return false;
            }

            // check to make sure we aren't overlapping a char (that doesn't match)
            // and get the count of intersections
            var intersections = 0;
            for(var r = row, i = 0; r < row + word.length; r++, i++){
                var result = canPlaceCharAt(word.charAt(i, 1), r, col);
                if(result === false) return false;
                intersections += result;
            }
        } else {
            throw "Invalid Direction";	
        }
        return intersections;
    }

    var randomDirection = function(){
        return Math.floor(Math.random()*2) ? "across" : "down";
    }

    var findBestPositionForWord = function(word){
        // check the char_index for every letter, and see if we can put it there in a direction
        var bests = [];
        for(var i = 0; i < word.length; i++){
            var possible_locations_on_grid = char_index[word.charAt(i)];
            if(!possible_locations_on_grid) continue;
            for(var j = 0; j < possible_locations_on_grid.length; j++){
                var point = possible_locations_on_grid[j];
                var r = point['row'];
                var c = point['col'];
                // the c - i, and r - i here compensate for the offset of character in the word
                var intersections_across = canPlaceWordAt(word, r, c - i, "across");
                var intersections_down = canPlaceWordAt(word, r - i, c, "down");

                if(intersections_across !== false)
                    bests.push({"intersections" : intersections_across, "row" : r, "col" : c - i, "direction" : "across"});
                if(intersections_down !== false)
                    bests.push({"intersections" : intersections_down, "row" : r - i, "col" : c, "direction" : "down"});
            }
        }

        if(bests.length == 0) return false;
        shuffle(bests);

        //bests.sort(function(a, b){
        //    return b.intersections - a.intersections;
        //});
        var best = bests[0];

        //for(var i = 1; i < bests.length; i++){
        //    // there is probably a subtle bug here...
        //    if(bests[i]["intersections"] >= 1 && Math.floor(Math.random()*bests.length) == i) best = bests[i];
        //}

        return best;
    }

    var clear = function(){
        for(var r = 0; r < grid.length; r++){
            for(var c = 0; c < grid[r].length; c++){
                grid[r][c] = null;
            }
        }
        char_index = {};
    }

    // constructor
    if(words_in.length < 2) throw "A crossword must have at least 2 words";
    if(words_in.length != clues_in.length) throw "The number of words must equal the number of clues";	

    // build the grid;
    var grid = new Array(GRID_ROWS);
    for(var i = 0; i < GRID_ROWS; i++){
        grid[i] = new Array(GRID_COLS);	
    }

    // build the element list (need to keep track of indexes in the originial input arrays)
    var word_elements = [];	
    for(var i = 0; i < words_in.length; i++){
        word_elements.push(new WordElement(words_in[i], i));
    }

    // I got this sorting idea from http://stackoverflow.com/questions/943113/algorithm-to-generate-a-crossword/1021800#1021800
    // seems to work well
    word_elements.sort(function(a, b){ return b.word.length - a.word.length; });
    //shuffle(word_elements);
}

var CrosswordUtils = {
    PATH_TO_PNGS_OF_NUMBERS : "/numbers/",

    toHtml : function(grid, show_answers){
        if(grid == null) return;
        var html = [];
        html.push("<table class='cwPuzzleMain'>");
        var label = 1;
        for(var r = 0; r < grid.length; r++){
            html.push("<tr>");
            for(var c = 0; c < grid[r].length; c++){
                var cell = grid[r][c];
                var is_start_of_word = false;
                if(cell == null){
                    var char = "&nbsp;";
                    var css_class = "blank-cell";
                } else {
                    var char = cell['char'];
                    var css_class = "";
                    var is_start_of_word = (cell['across'] && cell['across']['is_start_of_word']) || (cell['down'] && cell['down']['is_start_of_word']);
                }

                if(is_start_of_word) {
                    var img_url = CrosswordUtils.PATH_TO_PNGS_OF_NUMBERS + label + ".png";
                    html.push("<td id='pcr"+r+"c"+c+"' class='" + css_class + "' style=\"background-image:url('" + img_url + "')\">");
                    label++;			
                } else {
                    html.push("<td id='pcr"+r+"c"+c+"' class='" + css_class + "'>");					
                }

                if(cell != null) {
	                if(show_answers) {
	                    html.push(char);
	                } else {
	                    html.push("<input type='text' class='cellInput' maxlength='1' id='pcrInp"+r+"c"+c+"'>");								
	                }
            	}
            }
            html.push("</tr>");
        }
        html.push("</table>");
        return html.join("\n");
    }
}

var CrosswordCells = {
    toArrayOfCells: function(grid){
        if (grid == null)
            return null;
        var arr = [];
        for (var r=0; r < grid.length; r++) {
            for (var c=0; c < grid[r].length; c++) {
                var cell = grid[r][c];
                if(cell == null){
                    var char = "0";
                } else {
                    var char = cell['char'];
                }
                arr.push(char);
            }
        }
        return arr;
    } 
}