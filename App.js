import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TodoApp = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');
  const [editTaskId, setEditTaskId] = useState(null);
  const [editedTaskText, setEditedTaskText] = useState('');
  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('todolist');
      if (jsonValue !== null) {
        setTasks(JSON.parse(jsonValue))
      }
    } catch (error) {
      //
    }
  };

  const saveTasks = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('todolist', jsonValue);
    } catch (error) {
      //
    }
  };

  const addTask = () => {
    if (newTask.trim() !== '') {
      const updatedTasks = [...tasks, { id: Date.now(), text: newTask, completed: false }];
      setTasks(updatedTasks);
      setNewTask('');
    }
  };

  const deleteTask = taskId => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
  };

  const toggleTaskCompletion = taskId => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const editTask = () => {
    const updatedTasks = tasks.map(task => {
      if (task.id === editTaskId) {
        return { ...task, text: editedTaskText };
      }
      return task;
    });
    setTasks(updatedTasks);
    setEditTaskId(null);
    setEditedTaskText('');
  };

  const filterTasks = (taskList, filter) => {
    switch (filter) {
      case 'active':
        return taskList.filter(task => !task.completed);
      case 'completed':
        return taskList.filter(task => task.completed);
      case 'all':
      default:
        return taskList;
    }
  };

  const filteredTasks = filterTasks(tasks, taskFilter);

  const changeTaskFilter = filter => {
    setTaskFilter(filter);
  };

  const startEditTask = taskId => {
    const task = tasks.find(task => task.id === taskId);
    setEditTaskId(task.id);
    setEditedTaskText(task.text);
  };

  const cancelEditTask = () => {
    setEditTaskId(null);
    setEditedTaskText('');
  };

  const saveEditedTaskText = text => {
    setEditedTaskText(text);
  };

  const renderItem = ({ item }) => {
    if (item.id === editTaskId) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
          <TextInput
            style={{ flex: 1, marginRight: 10, borderBottomWidth: 1 }}
            value={editedTaskText}
            onChangeText={text => saveEditedTaskText(text)}
          />
          <TouchableOpacity onPress={cancelEditTask}>
            <Text style={{ color: 'red', marginRight: 10 }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={editTask}>
            <Text style={{ color: 'blue', marginRight: 10 }}>Save</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
        <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
          <Text style={{ textDecorationLine: item.completed ? 'line-through' : 'none' }}>{item.text}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => deleteTask(item.id)}>
            <Text style={{ color: 'red', marginRight: 10 }}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => startEditTask(item.id)}>
            <Text style={{ color: 'blue' }}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, marginTop: 50 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        <TextInput
          style={{ flex: 1, marginRight: 10, borderBottomWidth: 1 }}
          value={newTask}
          onChangeText={text => setNewTask(text)}
        />
        <Button title="Add Task" onPress={addTask} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Button
          title="All"
          onPress={() => changeTaskFilter('all')}
          style={taskFilter === 'all' ? { backgroundColor: 'gray' } : null}
        />
        <Button
          title="Active"
          onPress={() => changeTaskFilter('active')}
          style={taskFilter === 'active' ? { backgroundColor: 'gray' } : null}
        />
        <Button
          title="Completed"
          onPress={() => changeTaskFilter('completed')}
          style={taskFilter === 'completed' ? { backgroundColor: 'gray' } : null}
        />
      </View>
      {tasks.length > 0 ?
        <FlatList
        data={filteredTasks}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ flexGrow: 1 }}
        />
        :
        <Text style={{textAlign: 'center', marginTop: 30}}>Список задач пустой</Text>}
    </View>
  );
};

export default TodoApp;