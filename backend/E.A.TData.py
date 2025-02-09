# imported library needed
import matplotlib.pyplot as plt

# ----- Line graph------

#  Data used in the graph
x = [1,2,5,7,9]
y = [2,6,25,49,81]

#plots the graph
plt.plot(x,y)

# Attatches labels to each axis
plt.xlabel("Time(Hrs)")
plt.ylabel("Watts")

# shows the graph
plt.show()

# ------- bar graph -------

#  x and y variables for data (both variables must have the same length to work)
Xaxis = [1, 2, 3, 4, 5]
Yaxis = [10, 24, 36, 40, 5]

tick_label = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

# plotting a bar chart
#tick_label has to be tick_label or it doesn't work and you can use hexadecimal colours
plt.bar(Xaxis, Yaxis, tick_label = tick_label, width = 0.8, color = [ '#cf29c9', 'green'])

# naming the x-axis
#plt.xlabel('x - axis')

# naming the y-axis
plt.ylabel("Energy (Watts/Hr)")
# plot title
#plt.title('My bar chart!')

# function to show the plot
plt.show()

# ------ pie chart --------




