import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { salvarItem } from "../../api";

interface Item {
  nome: string;
  quantidade: number;
  preco: number;
}

export default function Index() {
  const [nome, setNome] = useState('')
  const [qtd, setQtd] = useState('')
  const [valor, setValor] = useState('')

  const goListPage = () => {
    router.push('/lista-itens')
  }

  const handleAddItem = async() => {
    try {
      const item: Item = {
        nome: nome,
        quantidade: parseInt(qtd),
        preco: parseFloat(valor)
      };
      await salvarItem(item);
      console.log('Item adicionado com sucesso!');
      setNome('');
      setQtd('');
      setValor('');
      goListPage();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Lista de Compras</Text>
        <TextInput style={styles.input} placeholder="Nome do item" value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Quantidade" keyboardType="numeric" value={qtd} onChangeText={setQtd} />
        <TextInput style={styles.input} placeholder="Valor" keyboardType="numeric" value={valor} onChangeText={setValor} />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleAddItem}>
        <Text style={styles.buttonText}>
          Adicionar
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={goListPage}>
        <Text style={styles.buttonText}>
          Acessar Estoque
        </Text>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#ccc',
    backgroundColor: '#e7e7e7',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
})