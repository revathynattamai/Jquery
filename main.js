$(function () {
    var $orders = $('#location');
    var $no = $('#no');
    var $id = $('#id');
    var $text = $('#text');
    var item = [];
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/data',
        success: function (orders) {
            $.each(orders, function (i, data) {
                $orders.append('<tr><td>'+data.no+'</td><td>'+data.id+'</td><td>'+data.text+'</td><td><button id ='+data.id+' type="button" class="remove">delete</button></td></tr>');
                // add();
            });
        },
        error: function()
        {
            alert("Load error");  
        }
    });


// Body load ends// 
//     To add

    $('#add_val').on ('click', function () {

        var order = {
            no: $no.val(),
            id: $id.val(),
            text: $text.val(),
        }
    $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/data',
        data: order,
        dataType:"json",
        async: true,
        success: function(newAdd)
        {
            console.log(newAdd);
            $orders.append('<tr><td>'+newAdd.no+'</td><td>'+newAdd.id+'</td><td>'+newAdd.text+'</td><td><button id ='+newAdd.id+' type="button" class="remove">delete</button></td></tr>');
            add();
            $("#reset").click();
        },
        error:function() {
            alert('ID should be unique');
        }
    });
   });



$orders.delegate('.remove', 'click', function(){
    var $tr = $(this).closest('tr');
    // console.log($tr.text());
    $.ajax({
        type: 'DELETE',
        url: 'http://localhost:3000/data/' + $(this).attr('id'),
        success:function() {
            // console.log('success');
            $tr.remove();
            add();
        }
        });
    });
});

//Graph part

var margin = {top: 20, right: 10, bottom: 30, left: 10},
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

function add(){
    d3.json("response.json", function(error, json) {
        main(json);
    });
}

function main(json) {
    var data = json.data;
    var xData = ["text"];
    drawGraph(xData, data);
}


function drawGraph(xData, data) {
    d3.select(".chart").selectAll("svg").remove();
    var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
    var y = d3.scale.linear().rangeRound([height, 0]);
    
    var color = d3.scale.category20();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
        
    
    var svg = d3.select(".chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dataIntermediate = xData.map(function (c) {
        return data.map(function (d) {
            return {x: d.id, y: +d[c]};
        });
    });
    
    var dataStackLayout = d3.layout.stack()(dataIntermediate);
    
    x.domain(dataStackLayout[0].map(function (d) {
        return d.x;
    }));
    
    y.domain([0,
        d3.max(dataStackLayout[dataStackLayout.length - 1],
                function (d) { return d.y0 + d.y;})
        ])
    .nice();
    
    var layer = svg.selectAll(".stack")
        .data(dataStackLayout)
        .enter().append("g")
        .attr("class", "stack")
        .style("fill", function (d, i) {
            return color(i);
        });

    layer.selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("x", function (d) {
            return x(d.x);
        })
        .attr("y", function (d) {
            return y(d.y + d.y0);
        })
        .attr("height", function (d) {
            return y(d.y0) - y(d.y + d.y0);
        })
        .attr("width", x.rangeBand());
    
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    

}
add();