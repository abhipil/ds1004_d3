var data = [];
var csvData = [];
var xVal ;
var yVal ;
var width = 450;
var height = 450;
var margin = { top:30,right:20,bottom:50,left:50};
var innerwidth = width - margin.left - margin.right;
var innerheight = height - margin.top-margin.bottom;
var categories =[];
var canvas = d3.select(".plot")
                .append("svg")
                .attr("width",width)
                .attr("height",height);

var update = $("#update");
update.on("click",function() {
    filteredData = filter(csvData,$("#mpg-min").val(),$("#mpg-max").val());
    render(filteredData,$("#sel-x option:selected").text(),$("#sel-y option:selected").text());
});

var xSelection = $("#sel-x"); 


var ySelection = $("#sel-y");


xSelection.on('change',function() {
    val = $("#sel-x option:selected").text(); 
    xVal = val;
    $("#sel-y").children().show();
    $("#sel-y option[value='"+val+"']").hide();
    update.text("Query "+val.toUpperCase());
    filteredData = filter(csvData,$("#mpg-min").val(),$("#mpg-max").val());
    if(filteredData.length == 0) {
        d3.select("#hovered").text("No data!!(Modify the range)");
        $("#plot").hide();
    }
    render(filteredData,$("#sel-x option:selected").text(),$("#sel-y option:selected").text());

});

ySelection.on('change',function() {
    val = $("#sel-y option:selected").text(); 
    yVal = val;
    $("#sel-x").children().show();
    $("#sel-x option[value='"+val+"']").hide();
    filteredData = filter(csvData,$("#mpg-min").val(),$("#mpg-max").val());
    render(filteredData,$("#sel-x option:selected").text(),$("#sel-y option:selected").text());
});
   
var xGroup = canvas.append("g")
                    .attr("transform","translate("+margin.left+","+(innerheight+margin.top)+")");

var yGroup = canvas.append("g")
                    .attr("transform","translate("+margin.left+","+margin.top+")");

var dotGroup = canvas.append("g")
                .attr("transform","translate("+margin.left+","+margin.top+")");

// text label for the x axis
var xLabel = canvas.append("text")
            .style("text-anchor", "middle")
            .attr("dx", 260 )
            .attr("dy", 440 );

// text label for the y axis
var yLabel = canvas.append("text")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .attr("dx", -60 )
            .attr("dy", 10 );


function renderChart(data,xVal,yVal) {
    var xScale = d3.scale.linear()
            .range([0,innerwidth])
            .domain([0,d3.max(data,function(d) {  return +d[xVal] })]);
    var yScale = d3.scale.linear()
            .range([innerheight,0])
            .domain(d3.extent(data,function(d) { return +d[yVal] } ) );

    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .tickFormat(d3.format("d"));;

    xGroup.call(xAxis);
    xLabel.text(xVal);
    yLabel.text(yVal);

    var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .tickFormat(d3.format("d"));;
    
    yGroup.call(yAxis);    

    var dots = dotGroup.selectAll("circle").data(data);
            
    dots.enter()
        .append("circle")
        .attr("cx",function(d) {
            return xScale(d[xVal]);
        })
        .attr("cy",function(d) {
            return yScale(d[yVal]);
        })
        .attr("r",5)
        .style("fill","rgba(0,0,0,0.5)")
        .style("stroke","black")
        .on("mouseenter",function(d,i) {
            d3.select("#hovered").text(d["origin"]);
        })
        .on("mouseleave",function(d,i) { 
            d3.select("#hovered").text("");
        });
    dots.exit().remove();
    dots.transition()
        .attr("cx",function(d) {
            return xScale(d[xVal]);
        })
        .attr("cy",function(d) {
            return yScale(d[yVal]);
        })
        .attr("r",5);
}

d3.csv("car.csv",function(error,data) { 
    var headerNames = d3.keys(data[0]);
    for(i=0;i<headerNames.length;i++) {
        if(!(headerNames[i]==="name" || headerNames[i]==="origin")) {
            categories.push(headerNames[i]);
        }
    }
    $.each(categories,function(){
        if(this == "mpg") {
            xSelection.append($("<option selected/>").val(this).text(this));
        } else {
            xSelection.append($("<option />").val(this).text(this));
        }        
    });

    $.each(categories,function(){
        if(this == "displacement") {
            ySelection.append($("<option selected/>").val(this).text(this));
        } else {
            ySelection.append($("<option />").val(this).text(this));
        }
    });
    $("#sel-y option[value='mpg']").hide();
    $("#sel-x option[value='displacement']").hide();
});
d3.csv("car.csv")
    .row(function(d){
        return { name : d.name , mpg : +d.mpg , cylinders : +d.cylinders , displacement : +d.displacement , horsepower :   +d.horsepower , weight : +d.weight , acceleration : +d.acceleration , year : +d.year , origin : d.origin }; 
    })
    .get(function(error,rows) {
        csvData = rows;
        data = rows;
        filteredData = filter(data,$("#mpg-min").val(),$("#mpg-max").val());
        render(filteredData,$("#sel-x option:selected").text(),$("#sel-y option:selected").text());
    });
function filter(data,min,max) {
    var x = $("#sel-x option:selected").text();
    var filteredData = data.filter(function(d) {
            return +d[x] >= min && +d[x] <= max ;
    }); 
    return filteredData;
}
function render(data,xVal,yVal) {
    renderChart(data,xVal,yVal);
}
