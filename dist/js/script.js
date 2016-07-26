var endereco= {
  colecoes:'https://oc-index.library.ubc.ca/collections',
  itens:'https://oc-index.library.ubc.ca/collections/',
  imagens: 'http://iiif.library.ubc.ca/image/cdm.'
}

var cabecalho={
  colecao:'<table class="table table-striped table-bordered"><tr><th>Collection code</th><th>Collection name</th></tr>',
  item:'<br><table class="table table-bordered" id="tabelaInfos"><tr><th>Properties</th><th>Information</th></tr>'
}

var minimoMaximo = [0,20,51,74,92,109,127,154,171,189,206,226,244,263,280,300];

$(document).ready(function(){
  inicio ();
  efeitoRolagemTela();
  $('#limpar').click(function(){
    limparResultadoPesquisa();
    $('#selecaoItem').hide();
    $('#campoPesquisa').val('');
  });
  $('#pesquisar').click(function(){
    limparResultadoPesquisa();
    validacaoColecao();
  });
  $('#selecaoItem').change(function(){
    tabelaItens();
  });
  $('.linksPaginacao').click(function(data){
    $(this).unbind('click');
    var pagina = $(this).attr('id');
    $("li").removeClass("active");
    $("li .linksPaginacao[id="+pagina+"]").parent().addClass("active");
    minimoPagina(pagina);
  });
});

$(document).keypress(function(e) {
  if (e.which == 13) {
    e.preventDefault();
    limparResultadoPesquisa();
    validacaoColecao();
  }
  if (e.which == 116) {
    alert ('efe cinco');
  }
});

function inicio (){
  $("#modalWelcome").modal("show");
  var minimo=minimoMaximo[0];
  var maximo=minimoMaximo[1];
  acervo(minimo,maximo);
  paginacaoTabela();
  $("li .linksPaginacao[id=1]").parent().addClass("active");
}

function limparResultadoPesquisa(){
  $('#tabelaInformacoes').html('');
  $('#limpar').hide();
}

function limparCampoPesquisa (){
  $('#campoPesquisa').val('');
  $('#selecaoItem').hide();
  $("#modalAttention").modal();
}

function minimoPagina (pagina){
  var minimo=minimoMaximo[pagina-1];
  var maximo=minimoMaximo[pagina];
  acervo(minimo,maximo);
}

function validacaoColecao (){
  var codigo=$('#campoPesquisa').val();
  if (codigo!=0) pesquisarColecao(codigo);
  else limparCampoPesquisa();
}

function efeitoRolagemTela (){
  $(".navbar a, footer a[href='#myPage']").on('click', function(event) {
    if (this.hash !== "") {
      event.preventDefault();
      var hash = this.hash;
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 900, function(){
        window.location.hash = hash;
      });
    }
  });

  $(window).scroll(function() {
    $(".slideanim").each(function(){
      var pos = $(this).offset().top;
      var winTop = $(window).scrollTop();
      if (pos < winTop + 600) {
        $(this).addClass("slide");
      }
    });
  });
}

function acervo(minimo,maximo){
  var tituloColecao='';
  var result='';
  $.getJSON(endereco.colecoes, function(data){
    result+=cabecalho.colecao;
    for (var n=minimo; n<maximo; n++){
      if (data.data[n]==undefined) {
        do {
          n++;
        } while(data.data[n]==undefined);
      }
      result+='<tr><td>' + data.data[n] + '</td>';
      acervoCodigo = data.data[n];
      tituloColecao=acervoTitulos(acervoCodigo);
      result+='<td>'+ tituloColecao + '</td></tr>';
    }
    result += '</table>';
    $('#tabelasAcervo').html(result);
    $("#modalWelcome").modal("hide");
  });
}

function acervoTitulos(acervoCodigo){
  var retorno = false;
  $.ajax({
      type: "GET",
      url: endereco.colecoes + '/' + acervoCodigo,
      dataType: "json",
      async: false,
      success: function(data) {
        retorno=data.data.title;
      }
  });
  return retorno;
}

function pesquisarColecao(codigo){
  $.getJSON(endereco.itens + codigo + '/items', function(data){
    var result='<option value="#"> Choose an item </option>';
    $('#selecaoItem').show();
    for (var x=0; x<data.data.length; x++){
      result+='<option value=' + data.data[x]._id + '>' + data.data[x]._id + '</option>';
    }
    $('#selecaoItem').html(result);
  })
  .fail(function(){
    limparCampoPesquisa();
  });
}

function tabelaItens (){
  var codigo=$('#campoPesquisa').val();
  var itemSelecionado = $('#selecaoItem').val();
  if (itemSelecionado!="#") {
    $.getJSON(endereco.itens + codigo + '/items/' + itemSelecionado, function(data){
      var result ='';
      result+=cabecalho.item;
      if ($(data.data.Creator).length != 0) result+='<tr><td> Creator </td><td>' + data.data.Creator[0].value + '</td></tr>';
      if ($(data.data.Contributor).length != 0) result+='<tr><td> Contributor </td><td>' + data.data.Contributor[0].value + '</td></tr>';
      if ($(data.data.Collection).length !=0) result+='<tr><td> Collection </td><td>' + data.data.Collection[0].value + '</td></tr>';
      if ($(data.data.DateCreated).length !=0) result+='<tr><td> Date created </td><td>' + data.data.DateCreated[0].value + '</td></tr>';
      if ($(data.data.DateIssued).length !=0) result+='<tr><td> Date Issued </td><td>' + data.data.DateIssued[0].value + '</td></tr>';
      if ($(data.data.Edition).length !=0) result+='<tr><td> Edition </td><td>' + data.data.Edition[0].value + '</td></tr>';
      if ($(data.data.Genre).length !=0) result+='<tr><td> Genre </td><td>' + data.data.Genre[0].value + '</td></tr>';
      if ($(data.data.Language).length !=0) result+='<tr><td> Language </td><td>' + data.data.Language[0].value + '</td></tr>';
      if ($(data.data.Country).length !=0) result+='<tr><td> Country </td><td>' + data.data.Country[0].value + '</td></tr>';
      if ($(data.data.Title).length !=0) result+='<tr><td> Title </td><td>' + data.data.Title[0].value + '</tr></table>';
      $('#tabelaInformacoes').html(result);
      imagens(codigo,itemSelecionado);
      $('#limpar').show();
    })  
  }
  else limparResultadoPesquisa();
}

function paginacaoTabela (){
  var links='<ul class="pagination">';
  for (var n=1; n<16; n++){
    links+='<li><a href="#tabelasAcervo" id="'+n+'"class="linksPaginacao">'+n+'</a></li>';
  }
  '</ul>';
  $('.paginacaoTabela').html(links);
}

function imagens(codigo,itemSelecionado){
  var itemSelecionadoAlterado = itemSelecionado.replace(".", "-");
  var retorno = '';
  retorno += '<img src="'+endereco.imagens+ codigo + '.' + itemSelecionadoAlterado +'/full/300,300/0/default.png">';
  console.log(retorno);
  $('#imagem').html(retorno);
}